import { Request, Response } from "express";
//
import db from "../../utils/db";
import { TrialCredit } from "../../types";
import { DEFAULT_TRIAL_CREDITS_FOR_NEW_USERS } from "../../configs/app";

// Takes a user ID, an optional amount (if none supplied, defaults to value specified in configs/app.ts), and creates a new TrialCredit record in the DB, or updates an existing one with the new value
// This will generally be used when new accounts are created, but it can also be manually triggered when we want to provide a user with credits
export const createTrialCredits = async (
  req: Request,
  res: Response<TrialCredit | { message: string }>,
) => {
  // Extract User ID and amount
  const { id } = res.locals.jwt_decoded;

  // Check for `amount` in payload
  const { amount } = req.body;
  const amountParsed = parseInt(amount);
  if (amountParsed && typeof amountParsed !== "number") {
    throw Error("Field `amount` is malformed");
  }

  // Determined amount
  const determinedAmount = amountParsed || DEFAULT_TRIAL_CREDITS_FOR_NEW_USERS;

  // Find record in db
  const existingTrialCredit = await db<TrialCredit>("trial_credit")
    .where("user_id", id)
    .first();

  // No record found, create new one
  if (!existingTrialCredit) {
    const [newTrialCredit] = await db<TrialCredit>("trial_credit")
      .insert({
        user_id: id,
        initial_amount: determinedAmount,
        remaining_amount: determinedAmount,
      })
      .returning("*");

    if (!newTrialCredit) {
      throw Error("Error creating new trial credit record");
    }

    return res.status(200).send(newTrialCredit);
  } else {
    // Record found, update it
    const [updatedTrialCredit] = await db<TrialCredit>("trial_credit")
      .where("id", existingTrialCredit.id)
      .update({
        initial_amount: determinedAmount,
        remaining_amount: determinedAmount,
        updated_at: new Date(),
      })
      .returning("*");

    if (!updatedTrialCredit) {
      throw Error("Error updating the trial credit record");
    }

    return res.status(200).send(updatedTrialCredit);
  }
};
