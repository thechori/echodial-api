import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

export const createStripeCustomerPortalSession = async (
  req: Request,
  res: Response,
) => {
  // Extract User details
  const { email, stripe_customer_id } = res.locals.jwt_decoded;

  // First, let's check to see if user has a stripe_customer_id (faster lookup since we don't have to query stripe Customer list)
  let customerId = null;

  if (stripe_customer_id) {
    customerId = stripe_customer_id;
  } else {
    // Get all Stripe Customers
    const customers = await stripe.customers.list({
      email: email,
    });

    if (!customers) {
      res.status(404);
      throw Error("No Stripe customers found");
    }

    // Find single customer using email
    const customer = customers.data.find((c) => c.email === email);

    if (!customer) throw Error("No Stripe customer found with that email");

    customerId = customer.id;
  }

  if (customerId === null) {
    res.status(404);
    throw Error("Stripe customer id not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${envConfig.clientHost}/subscription/callback`,
  });

  res.status(200).send(session);
};
