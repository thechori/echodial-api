import { Request, Response } from "express";
//
import db from "../../utils/db";
import { TrialCredit } from "../../types";

export const deductTrialCredits = async (
  req: Request,
  res: Response<TrialCredit | { message: string }>,
) => {
  // Extract User ID and amount
  const { id } = res.locals.jwt_decoded;

  // Check for `amount` in payload
  const { amount } = req.body;
  const amountParsed = parseInt(amount);
  if (!amountParsed || typeof amountParsed !== "number") {
    throw Error("Field `amount` is missing or malformed");
  }

  // Find record in db
  const [trialCredit] = await db<TrialCredit>("trial_credit")
    .where("user_id", id)
    .first()
    .decrement("remaining_amount", amountParsed)
    .update({
      updated_at: new Date(),
    })
    .returning("*");

  // Handle no record found
  if (!trialCredit) {
    throw Error("No trial credits found");
  }

  return res.status(200).send(trialCredit);
};
