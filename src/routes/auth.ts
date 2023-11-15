import { Router } from "express";
import { differenceInMinutes } from "date-fns";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { sesClient } from "../services/ses-client";
import { createSendEmailCommand } from "../utils/email";
import envConfig from "../configs/env";
import { PasswordResetToken, User } from "../types";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  COOKIE_REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRES_IN,
  SALT_ROUNDS,
} from "../configs/auth";
import { PASSWORD_RESET_TOKEN_EXPIRATION_IN_MINUTES } from "../configs/auth";

const router = Router();

// Sign in
router.post("/sign-in", async (req, res) => {
  // Grab body vars
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw Error("Please provide an email and password");
  }

  // Cleanse email input (lowercase/trim)
  const emailClean = email.trim().toLowerCase();

  // Look up email in DB
  const user = await db<User>("user").where("email", emailClean).first();

  if (!user) {
    res.status(404);
    throw Error("Email and password combination not found");
  }

  // Hash password and compare to password_hash in DB record
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    res.status(404);
    throw Error("Email and password combination not found");
  }

  // Generate access and refresh tokens
  const refreshToken = jwt.sign(user, envConfig.bcryptSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
  const accessToken = jwt.sign(user, envConfig.bcryptSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  res
    .status(200)
    .cookie(COOKIE_REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    })
    .json(accessToken);
});

// Refresh access_token using refresh_token in cookie
router.get("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies[COOKIE_REFRESH_TOKEN];

  if (!refreshToken) throw Error("Refresh token not found");

  const decoded = jwt.verify(refreshToken, envConfig.bcryptSecret);

  // TODO: Improve by adding `user` object to encapsulate the data
  // Remove `iat` and `exp` from decoded token in order to set again
  // @ts-ignore
  delete decoded.iat;
  // @ts-ignore
  delete decoded.exp;

  const accessToken = jwt.sign(decoded, envConfig.bcryptSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  res.header("Authorization", accessToken).json(accessToken);
});

// Request password reset
// This endpoint is used whenever a user forgets their password and need to have
// an email sent for them to click and verify that they own it (before we properly
// let them reset the password, to avoid fraud)
router.post("/reset-password-request", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw Error("Email is missing");
  }

  // Send a success 200 response -- we don't need to inform the user if the email is found
  // or not because this could give away precious information about our database
  res.status(200).send();

  // Cleanse email input (lowercase/trim)
  const emailClean = email.trim().toLowerCase();

  try {
    // Look up email in DB
    const user = await db<User>("user").where("email", emailClean).first();

    // User not found
    if (!user) {
      return console.info("No email found with email: ", emailClean);
    }

    // Check for existing token
    const existingPasswordResetToken = await db<PasswordResetToken>(
      "password_reset_token",
    )
      .where("user_id", user.id)
      .first();
    console.log("existingPasswordResetToken: ", existingPasswordResetToken);

    if (existingPasswordResetToken) {
      // Delete if found
      const deletedToken = await db<PasswordResetToken>("password_reset_token")
        .del()
        .where("id", existingPasswordResetToken.id);
      console.log("deletedToken", deletedToken);
    }

    // Create a token
    const token = crypto.randomBytes(32).toString("hex");
    const newPasswordResetTokenContent: Partial<PasswordResetToken> = {
      user_id: user.id,
      token,
    };

    // Insert into database
    const newPasswordResetToken = await db<PasswordResetToken>(
      "password_reset_token",
    )
      .insert(newPasswordResetTokenContent)
      .returning("*");

    // Handle errors
    if (newPasswordResetToken.length !== 1) {
      return console.error(
        "An error occurred when creating a single new PasswordResetToken record",
      );
    }

    // Create command
    const sendEmailCommand = createSendEmailCommand({
      toAddresses: [emailClean],
      fromAddress: "support@echodial.com",
      subject: "Password reset request",
      bodyHtml: `
      <html>
        <body>
          <style>
            /* TODO: figure out how to make this work */
            .hover:hover {
              color: red;
            }
            .purple {
              color: purple;
            }
          </style>
          <div>
            <div>
              <img src="https://echodial.com/assets/EchoDial-temp-logo-full-dark-6e151d63.png" alt="EchoDial logo" width="240" />
            </div>
            <h2 style="color: #0074ff;">Change your password</h2>
            <p class="purple">We have received a request to reset the password for your EchoDial account (email).</p>
            <p>If this was not you, ignore this email and your password will not be changed. The link below will remain active for 1 hour.</p>
            <a class="hover" href="${envConfig.clientHost}/reset-password/${token}" style="font-size: 1rem; background-color: #0074ff; color: white; border: none; border-radius: 3px; padding: 0.5rem 1rem;">Reset password</a>
          </div>
        </body>
      </html>
      `,
    });

    // Send email
    await sesClient.send(sendEmailCommand);
  } catch (e) {
    return console.error(extractErrorMessage(e));
  }
});

// Pass token to endpoint to be returned the email for UI
router.get("/reset-password-token/:token", async (req, res) => {
  const { token } = req.params;
  // Check for missing field
  if (!token) {
    throw Error("Missing `token` field");
  }

  const passwordResetToken = await db<PasswordResetToken>(
    "password_reset_token",
  )
    .where("token", token)
    .first();

  // Handle error
  if (!passwordResetToken) {
    throw Error("An error occurred when fetching the password reset token");
  }

  const timeElapsed = differenceInMinutes(
    new Date().getTime(),
    passwordResetToken.created_at.getTime(),
  );
  // Checks for stale token
  if (timeElapsed > PASSWORD_RESET_TOKEN_EXPIRATION_IN_MINUTES) {
    const deletedToken = await db<PasswordResetToken>("password_reset_token")
      .del()
      .where("id", passwordResetToken.id);

    // Handle error
    if (!deletedToken) {
      throw Error("Error deleting password reset token");
    }

    throw Error("Password reset link has expired, please request a new one");
  }

  // Look up user via id to fetch email
  const user = await db<User>("user")
    .where("id", passwordResetToken.user_id)
    .first();

  if (!user) {
    throw Error(
      "An error occurred when fetching the user associated with the password reset token",
    );
  }

  return res.status(200).json(user.email);
});

// Pass in token, email, and new password -> update user password
router.post("/reset-password", async (req, res) => {
  const { token, password, email } = req.body;

  // Check for missing fields
  if (!token || !password || !email) {
    throw Error("Missing `token` or `password` or `email` field");
  }
  // Validate password
  if (password.length < 6) {
    throw Error("Password must be at least 6 characters long");
  }

  // Find token
  const foundToken = await db<PasswordResetToken>("password_reset_token")
    .where("token", token)
    .first();

  // Handle error
  if (!foundToken) {
    throw Error("No password reset token found");
  }

  const timeElapsed = differenceInMinutes(
    new Date().getTime(),
    foundToken.created_at.getTime(),
  );
  // Checks for stale token
  if (timeElapsed > PASSWORD_RESET_TOKEN_EXPIRATION_IN_MINUTES) {
    const deletedToken = await db<PasswordResetToken>("password_reset_token")
      .del()
      .where("id", foundToken.id);

    // Handle error
    if (!deletedToken) {
      throw Error("Error deleting password reset token");
    }
    throw Error("Password reset link has expired, please request a new one");
  }

  // Hash password before inserting to DB
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Update user optimistically, we're assuming the email passed in is valid if the token is valid
  const updatedUser = await db<User>("user")
    .where("email", email)
    .update({
      password_hash: passwordHash,
    })
    .returning("*");

  // Handle error
  if (!updatedUser) {
    throw Error("No user found");
  }

  // Delete the ResetPasswordToken
  const deletedToken = await db<PasswordResetToken>("password_reset_token")
    .del()
    .where("id", foundToken.id);

  // Handle error
  if (!deletedToken) {
    throw Error("Error deleting password reset token");
  }

  return res.status(200).send();
});

export default router;
