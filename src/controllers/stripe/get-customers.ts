import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Customers
export const getStripeCustomers = async (req: Request, res: Response) => {
  const customers = (await stripe.customers.list()).data;

  res.status(200).send(customers);
};
