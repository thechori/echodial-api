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

  if (!user) {
    return res.status(400).send({ message: "No user found" });
  }

  // Handle no subscription
  if (user.stripe_subscription_id === null) {
    return res.status(200).send(null);
  }

  // Search for Subscription via stripe_subscription_id in User record
  const subscription = await stripe.subscriptions.retrieve(
    user.stripe_subscription_id
  );

  // Handle no subscription found
  if (!subscription) {
    return res.status(200).send(null);
  }

  res.status(200).send({
    status: subscription.status,
    trial_start: subscription.trial_start,
    trial_end: subscription.trial_end,
    trial_settings: subscription.trial_settings,
  });
};
