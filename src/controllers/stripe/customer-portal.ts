import { Request, Response } from "express";
import Stripe from "stripe";
//
import envConfig from "../../configs/env";

const stripe = new Stripe(envConfig.stripeApiKey);

export const createStripeCustomerPortalSession = async (
  req: Request,
  res: Response,
) => {
  // Extract Stripe Customer ID
  const { stripe_customer_id } = res.locals.jwt_decoded;

  if (stripe_customer_id === null) {
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
    customer: stripe_customer_id,
    return_url: `${envConfig.clientHost}/subscription/callback`,
    configuration: configuration.id,
  });

  res.status(200).send(session);
};
