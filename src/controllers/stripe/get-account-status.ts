import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";
import db from "../../utils/db";
import { User } from "../../types";

const stripe = new Stripe(envConfig.stripeApiKey);

type TAccountStatus = {
  subscription: null | "standard" | "pro" | "unlimited";
};

// Returns
// `null` if no trial or subscription
// `number` of days remaining
export const getAccountStatus = async (
  req: Request,
  res: Response<TAccountStatus | { message: string }>,
) => {
  // Extract User ID
  const { id } = res.locals.jwt_decoded;

  // Search for User via ID
  const user = await db<User>("user").where("id", id).first();

  if (!user) {
    return res.status(400).send({ message: "No user found" });
  }

  // Handle no subscription
  if (user.stripe_subscription_id === null) {
    return res.status(200).send({
      subscription: null,
    });
  }

  // Search for Subscription via stripe_subscription_id in User record
  const subscription = await stripe.subscriptions.retrieve(
    user.stripe_subscription_id,
  );

  // Handle no subscription found
  if (!subscription) {
    return res.status(200).send({
      subscription: null,
    });
  }

  console.log("subscription", subscription);

  res.status(200).send({
    subscription: "unlimited",
  });
};
