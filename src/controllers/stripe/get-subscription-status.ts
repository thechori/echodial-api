import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";
import db from "../../utils/db";
import { User } from "../../types";

const stripe = new Stripe(envConfig.stripeApiKey);

type TSubscriptionStatus = {
  description: string | null;
  status: Stripe.Subscription.Status | null;
  items: Stripe.ApiList<Stripe.SubscriptionItem> | null;
};

// Returns
// `null` if no trial or subscription
// `number` of days remaining
export const getSubscriptionStatus = async (
  req: Request,
  res: Response<TSubscriptionStatus | { message: string }>,
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
      status: null,
      description: "No subscription found",
      items: null,
    });
  }

  // Search for Subscription via stripe_subscription_id in User record
  const subscription = await stripe.subscriptions.retrieve(
    user.stripe_subscription_id,
  );

  // Handle no subscription found
  if (!subscription) {
    return res.status(200).send({
      status: null,
      description: "No subscription found",
      items: null,
    });
  }

  res.status(200).send({
    status: subscription.status,
    description: subscription.description,
    items: subscription.items,
  });
};
