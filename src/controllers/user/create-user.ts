import { RequestHandler } from "express";
import bcrypt from "bcrypt";
//
import { isValidPhoneNumberForDb } from "../../utils/validators/phone";
import { isValidEmailAddress } from "../../utils/validators/email";
import { SALT_ROUNDS } from "../../configs/auth";
import db from "../../utils/db";
import { TrialCredit, User } from "../../types";
import { extractErrorMessage } from "../../utils/error";
import { DEFAULT_TRIAL_CREDITS_FOR_NEW_USERS } from "../../configs/app";

export const createUser: RequestHandler = async (req, res) => {
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
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Run DB query
    const [newUser] = await db<User>("user")
      .insert({
        email: emailClean,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      .returning("*");

    // Create new trial credit record
    const [newTrialCredit] = await db<TrialCredit>("trial_credit")
      .insert({
        user_id: newUser.id,
        initial_amount: DEFAULT_TRIAL_CREDITS_FOR_NEW_USERS,
        remaining_amount: DEFAULT_TRIAL_CREDITS_FOR_NEW_USERS,
      })
      .returning("*");

    if (!newTrialCredit) {
      throw Error("Error creating new trial credit record");
    }

    return res
      .status(201)
      .json({ message: "Successfully created new user", data: newUser });
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
};
