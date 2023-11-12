import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

// Display list of all Subscriptions
// export const getStripeSessions = async (req: Request, res: Response) => {

// };

export const createStripeCheckoutSession = async (
  req: Request,
  res: Response,
) => {
  // Extract Stripe Customer ID
  const { stripe_customer_id } = res.locals.jwt_decoded;

  if (stripe_customer_id === null) {
    throw Error("Stripe customer id not found");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripe_customer_id,
    success_url: `${envConfig.clientHost}/subscription/callback`,
    cancel_url: `${envConfig.clientHost}/settings`,
    mode: "setup",
    currency: "usd",
  });

  res.status(200).send(checkoutSession);
};
