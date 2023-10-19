require("dotenv").config();

import express from "express";
import bcrypt from "bcrypt";
//
import db from "../utils/db";
import { isValidPhoneNumberForDb } from "../utils/validators/phone";
import { isValidEmailAddress } from "../utils/validators/email";
import { authMiddleware } from "../middlewares/auth";
import { saltRounds } from "../configs/auth";
import { extractErrorMessage } from "../utils/error";

const router = express.Router();

// Read all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await db("user");
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// Read single user by id
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const users = await db("user").where("id", id);
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// Create new user
router.post("/", async (req: any, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  /* Validate data before inserting into the database */

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (phone && !isValidPhoneNumberForDb(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (!isValidEmailAddress(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Cleanse email input (lowercase/trim)
  const emailClean = email.trim().toLowerCase();

  try {
    // Hash password before inserting to DB
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Run DB query
    const newUser = await db("user")
      .insert({
        email: emailClean,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      .returning("*");

    return res
      .status(201)
      .json({ message: "Successfully created new user", data: newUser[0] });
  } catch (e) {
    // Safely check for `code` in error object
    if (e !== null && typeof e === "object" && "code" in e && "message" in e) {
      console.log("e.code: ", e.code);

      let errorMessage = `Error ${e.code}: ${e.message}`;

      // Email or phone already exists
      if (e.code === "23505") {
        errorMessage = "Email address or phone is already registered";
      }

      return res.status(400).send({ message: errorMessage });
    }

    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

export default router;
