import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { authMiddleware } from "../middlewares/auth";
import { sesClient } from "../services/ses-client";
import { createSendEmailCommand } from "../utils/email";

dotenv.config();

const router = Router();

// Endpoint is mostly for capturing user behavior, the heavy work is done on the client when they clear the local storage item
router.get("/sign-out", authMiddleware, async (req: Request, res: Response) => {
  const { jwt } = res.locals;
  if (!jwt) {
    return res.status(400).send("no jwt found");
  }

  const { id } = jwt;

  // await db("user_event").insert({
  //   user_id: id,
  //   user_event_type_id: 4, // id 4 = "sign-out"
  // });

  return res.status(200).send();
});

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
  const user = await db("user").where("email", emailClean).first();

  if (!user) {
    return res.status(400).json({ message: "Email not found" });
  }

  // Hash password and compare to password_hash in DB record
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(403).json({ message: "Incorrect password" });
  }

  // Generate JWT
  const token = jwt.sign(user, process.env.BCRYPT_SECRET as string, {
    expiresIn: "7d",
  });

  res.status(200).json(token);

  // Record `user_event`
  // await db("user_event").insert({
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
      process.env.BCRYPT_SECRET as string
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
    const user = await db("user").where("email", emailClean).first();

    // User not found
    if (!user) {
      return console.info("No email found with email: ", emailClean);
    }

    // Create a token that lasts for 24hr
    // TODO

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
            <p>If this was not you, ignore this email and your password will not be changed. The link below will remain active for 24 hours.</p>
            <button class="hover" style="font-size: 1rem; background-color: #0074ff; color: white; border: none; border-radius: 3px; padding: 0.5rem 1rem;">Reset password</button>
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

export default router;
