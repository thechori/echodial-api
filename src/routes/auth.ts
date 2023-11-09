import { Router } from "express";
import dotenv from "dotenv";
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
import { saltRounds } from "../configs/auth";
import { passwordResetTokenExpirationInMinutes } from "../configs/auth";
import { differenceInMinutes } from "date-fns";
dotenv.config();

const router = Router();

// Sign in
router.post("/sign-in", async (req, res) => {
  // Grab body vars
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide an email and password" });
  }

  // Cleanse email input (lowercase/trim)
  const emailClean = email.trim().toLowerCase();

  // Look up email in DB
  const user = await db<User>("user").where("email", emailClean).first();

  if (!user) {
    return res
      .status(400)
      .json({ message: "Email and password combination not found" });
  }

  // Hash password and compare to password_hash in DB record
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res
      .status(403)
      .json({ message: "Email and password combination not found" });
  }

  // Generate JWT
  const token = jwt.sign(user, process.env.BCRYPT_SECRET as string, {
    expiresIn: "7d",
  });

  res.status(200).json(token);

  // Record `user_event`
  // await db<UserEvent>("user_event").insert({
  //   user_id: user.id,
  //   user_event_type_id: 3, // id 3 = "sign-in"
  // });
});

// Authenticate
router.get("/authenticate", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });
  }

  try {
    const decoded = await jwt.verify(
      token,
      process.env.BCRYPT_SECRET as string,
    );
    return res.status(200).json({ message: "Success", data: decoded });
  } catch (e) {
    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// Request password reset
// This endpoint is used whenever a user forgets their password and need to have
// an email sent for them to click and verify that they own it (before we properly
// let them reset the password, to avoid fraud)
router.post("/reset-password-request", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(403).json({ message: "Email is missing" });
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
    return res.status(400).send({ message: "Missing `token` field" });
  }

  const passwordResetToken = await db<PasswordResetToken>(
    "password_reset_token",
  )
    .where("token", token)
    .first();

  // Handle error
  if (!passwordResetToken) {
    return res.status(400).send({
      message: "An error occurred when fetching the password reset token",
    });
  }

  const timeElapsed = differenceInMinutes(
    new Date().getTime(),
    passwordResetToken.created_at.getTime(),
  );
  // Checks for stale token
  if (timeElapsed > passwordResetTokenExpirationInMinutes) {
    const deletedToken = await db<PasswordResetToken>("password_reset_token")
      .del()
      .where("id", passwordResetToken.id);

    // Handle error
    if (!deletedToken) {
      return res.status(400).send({
        message: "Error deleting password reset token",
      });
    }
    return res.status(400).send({
      message: "Password reset link has expired, please request a new one",
    });
  }

  // Look up user via id to fetch email
  const user = await db<User>("user")
    .where("id", passwordResetToken.user_id)
    .first();

  if (!user) {
    return res.status(400).send({
      message:
        "An error occurred when fetching the user associated with the password reset token",
    });
  }

  return res.status(200).send(user.email);
});

// Pass in token, email, and new password -> update user password
router.post("/reset-password", async (req, res) => {
  const { token, password, email } = req.body;

  // Check for missing fields
  if (!token || !password || !email) {
    return res
      .status(400)
      .send({ message: "Missing `token` or `password` or `email` field" });
  }
  // Validate password
  if (password.length < 6) {
    return res
      .status(400)
      .send({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Find token
    const foundToken = await db<PasswordResetToken>("password_reset_token")
      .where("token", token)
      .first();

    // Handle error
    if (!foundToken) {
      return res.status(400).send({
        message: "No password reset token found",
      });
    }

    const timeElapsed = differenceInMinutes(
      new Date().getTime(),
      foundToken.created_at.getTime(),
    );
    // Checks for stale token
    if (timeElapsed > passwordResetTokenExpirationInMinutes) {
      const deletedToken = await db<PasswordResetToken>("password_reset_token")
        .del()
        .where("id", foundToken.id);

      // Handle error
      if (!deletedToken) {
        return res.status(400).send({
          message: "Error deleting password reset token",
        });
      }
      return res.status(400).send({
        message: "Password reset link has expired, please request a new one",
      });
    }

    // Hash password before inserting to DB
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user optimistically, we're assuming the email passed in is valid if the token is valid
    const updatedUser = await db<User>("user")
      .where("email", email)
      .update({
        password_hash: passwordHash,
      })
      .returning("*");

    // Handle error
    if (!updatedUser) {
      return res.status(400).send({
        message: "No user found",
      });
    }

    // Delete the ResetPasswordToken
    const deletedToken = await db<PasswordResetToken>("password_reset_token")
      .del()
      .where("id", foundToken.id);

    // Handle error
    if (!deletedToken) {
      return res.status(400).send({
        message: "Error deleting password reset token",
      });
    }

    return res.status(200).send();
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
