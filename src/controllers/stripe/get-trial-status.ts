import Stripe from "stripe";
//
import envConfig from "../../configs/env";
import db from "../../utils/db";
import { User } from "../../types";
import { Request, Response } from "express";

const stripe = new Stripe(envConfig.stripeApiKey);

// Returns
// `null` if no trial or subscription
// `number` of days remaining
export const getTrialStatus = async (req: Request, res: Response) => {
  // Extract User ID
  const { id } = res.locals.jwt_decoded;

  // Search for User via ID
  const user = await db<User>("user").where("id", id).first();

  //
  console.log("user", user);

  if (!user) {
    return res.status(400).send({ message: "No user found" });
  }

  // Handle no subscription
  if (user.stripe_subscription_id === null) {
    return res.status(200).send(null);
  }

  console.log("eeek ");

  // Search for Subscription via stripe_subscription_id in User record
  const subscriptions = await stripe.subscriptions.retrieve(
    user.stripe_subscription_id
  );

  res.status(200).send({
    status: subscriptions.status,
    trial_start: subscriptions.trial_start,
    trial_end: subscriptions.trial_end,
  });
};
