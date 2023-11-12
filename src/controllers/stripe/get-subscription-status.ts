import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

type TSubscriptionStatus = {
  description: string | null;
  status: Stripe.Subscription.Status | null;
  items: Stripe.ApiList<Stripe.SubscriptionItem> | null;
};

// Note: Stripe does not give us an easy way to fetch a Subscription via a Customer email since the email field
// is NOT a unique key. To do this, we first have to find all Customers by email, and then use the Customer ID
// as a means to find the Subscription
export const getSubscriptionStatus = async (
  req: Request,
  res: Response<TSubscriptionStatus | { message: string }>,
) => {
  // Extract User email
  const { email } = res.locals.jwt_decoded;

  // Get all Stripe Customers
  const customers = await stripe.customers.list({
    email: email,
  });

  if (!customers) throw Error("No Stripe customers found");

  // Find single customer using email
  const customer = customers.data.find((c) => c.email === email);

  if (!customer) throw Error("No Stripe customer found with that email");

  // Search for Subscription via Customer
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
  });

  if (!subscriptions)
    throw Error("No Stripe subscription found with that customer id");

  const subscription = subscriptions.data[0];

  if (!subscription) throw Error("No Stripe subscription found");

  res.status(200).send({
    status: subscription.status,
    description: subscription.description,
    items: subscription.items,
  });
};
