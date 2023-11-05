import Stripe from "stripe";
import asyncHandler from "express-async-handler";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Subscriptions
export const getStripeSubscriptions = asyncHandler(async (req, res, next) => {
  const subscriptions = (await stripe.subscriptions.list()).data;

  res.status(200).send(subscriptions);
});
