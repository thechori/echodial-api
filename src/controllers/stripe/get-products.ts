import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Products
export const getStripeProducts = async (req: Request, res: Response) => {
  const products = (await stripe.products.list()).data;

  res.status(200).json(products);
};
