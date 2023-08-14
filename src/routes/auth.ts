import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { authMiddleware } from "../middlewares/auth";

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

  return res.status(200).send("ok");
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

export default router;
