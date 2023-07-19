import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";

dotenv.config();
const router = Router();

// Old
router.get("/authorize", (req: Request, res: Response) => {
  const { authorization } = req.headers;
  if (authorization === process.env.ADMIN_PASSWORD) {
    return res.status(200).send("Success");
  }

  return res.status(401).send("Incorrect password");
});

// Sign in
router.post("/sign-in", async (req, res) => {
  // Grab body vars
  const { email, password } = req.body;

  // Look up email in DB
  const user = await db("user").where("email", email).first();

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

  return res.status(200).json(token);
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
  } catch (error) {
    return res.status(500).json({ message: extractErrorMessage(error) });
  }
});

export default router;
