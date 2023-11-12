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

    if (!customers) throw Error("No Stripe customers found");

    // Find single customer using email
    const customer = customers.data.find((c) => c.email === email);

    if (!customer) throw Error("No Stripe customer found with that email");

    customerId = customer.id;
  }

  if (customerId === null) {
    throw Error("Stripe customer id not found");
  }

  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "EchoDial partners with Stripe for simplified billing.",
    },
    features: {
      invoice_history: {
        enabled: true,
      },
      customer_update: {
        enabled: true,
        allowed_updates: ["name"],
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        products: [
          {
            prices: ["price_1NvS4dKGxd0U3zJwIewutyC0"],
            product: "prod_OitsykoSUqeKpi", // standard
          },
          {
            prices: ["price_1NvS4yKGxd0U3zJwoeFX6FJL"],
            product: "prod_OitsB8Q8HQzlt6", // pro
          },
          {
            prices: ["price_1NvS5LKGxd0U3zJwR3hiVSZe"],
            product: "prod_OittJ702oronDJ", // unlimited
          },
        ],
      },
    },
  });

  console.log("configuration", configuration);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${envConfig.clientHost}/subscription/callback`,
    configuration: configuration.id,
  });

  res.status(200).send(session);
};
