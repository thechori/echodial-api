import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Subscriptions
export const getStripeSubscriptions = async (req: Request, res: Response) => {
  const subscriptions = (await stripe.subscriptions.list()).data;

  res.status(200).send(subscriptions);
};
