import { Request, Response } from "express";
//
import { TrialCredit } from "../../types";
import db from "../../utils/db";

export const getTrialCredits = async (
  req: Request,
  res: Response<TrialCredit | { message: string }>,
) => {
  // Extract User ID
  const { id } = res.locals.jwt_decoded;

  // Find record in db
  const trialCredit = await db<TrialCredit>("trial_credit")
    .where("user_id", id)
    .first();

  if (!trialCredit) {
    return res.status(400).send({ message: "No trial credits found" });
  }

  return res.status(200).send(trialCredit);
};
