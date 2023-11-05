require("dotenv").config();

import express from "express";
import bcrypt from "bcrypt";
import Stripe from "stripe";
//
import db from "../utils/db";
import { isValidPhoneNumberForDb } from "../utils/validators/phone";
import { isValidEmailAddress } from "../utils/validators/email";
import { authMiddleware } from "../middlewares/auth";
import { saltRounds } from "../configs/auth";
import { extractErrorMessage } from "../utils/error";
import envConfig from "../configs/env";
import { User } from "../types";

const stripe = new Stripe(envConfig.stripeApiKey);
const router = express.Router();

// Read all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await db<User>("user");
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
    const users = await db<User>("user").where("id", id);
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
    const newUser = await db<User>("user")
      .insert({
        email: emailClean,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      .returning("*");

    // Create Stripe Customer and Subscription
    const stripeCustomer = await stripe.customers.create({
      email: emailClean,
      name: `${firstName} ${lastName}`,
      phone: phone,
    });

    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      trial_period_days: 7,
      items: [
        {
          price: "price_1NvS4dKGxd0U3zJwIewutyC0", // (test) Standard plan - $69.99
          // price: "price_1O8pAnKGxd0U3zJwosJYrkY8", // (live) Dollar Donation Club
        },
      ],
    });

    const updatedUser = await db<User>("user")
      .update({
        stripe_customer_id: stripeCustomer.id,
        stripe_subscription_id: stripeSubscription.id,
      })
      .where("id", newUser[0].id)
      .returning("*");

    return res
      .status(201)
      .json({ message: "Successfully created new user", data: updatedUser[0] });
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
