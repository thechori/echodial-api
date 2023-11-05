import Stripe from "stripe";
import asyncHandler from "express-async-handler";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Products
export const getStripeProducts = asyncHandler(async (req, res, next) => {
  const products = (await stripe.products.list()).data;

  res.status(200).send(products);
});
