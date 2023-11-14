import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

type TSubscriptionStatus = {
  subscription: Stripe.Subscription;
  product: Stripe.Product;
};

// Note: Stripe does not give us an easy way to fetch a Subscription via a Customer email since the email field
// is NOT a unique key. To do this, we first have to find all Customers by email, and then use the Customer ID
// as a means to find the Subscription
export const getSubscriptionStatus = async (
  req: Request,
  res: Response<TSubscriptionStatus | { message: string }>,
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

    if (!customers) throw Error("No Customers found");

    // Find single customer using email
    const customer = customers.data.find((c) => c.email === email);

    if (!customer) throw Error("No Customer found with that email");

    customerId = customer.id;
  }

  // Search for Subscription via Customer
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });

  if (!subscriptions)
    throw Error("No Subscription found with that customer id");

  const subscription = subscriptions.data[0];

  if (!subscription) throw Error("No Subscription found");

  const product = await stripe.products.retrieve(
    subscription.items.data[0].price.product.toString(),
  );

  if (!product) throw Error("No Product found");

  res.status(200).json({
    subscription,
    product,
  });
};
