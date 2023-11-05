import Stripe from "stripe";
import asyncHandler from "express-async-handler";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Customers
export const getStripeCustomers = asyncHandler(async (req, res, next) => {
  const customers = (await stripe.customers.list()).data;

  res.status(200).send(customers);
});
