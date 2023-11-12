import { Router } from "express";
//
import { getStripeCustomers } from "../controllers/stripe/get-customers";
import { getStripeSubscriptions } from "../controllers/stripe/get-subscriptions";
import { getStripeProducts } from "../controllers/stripe/get-products";
import { getSubscriptionStatus } from "../controllers/stripe/get-subscription-status";
import { createStripeCustomerPortalSession } from "../controllers/stripe/customer-portal";
import { createStripeCheckoutSession } from "../controllers/stripe/sessions";

const router = Router({ mergeParams: true });

// Return LeadPropertyGroup items
router.get("/customers", getStripeCustomers); // TODO: lock this down to super users
router.get("/subscriptions", getStripeSubscriptions); // TODO: lock this down to super users
router.get("/products", getStripeProducts); // TODO: lock this down to super users
router.get("/subscription-status", getSubscriptionStatus);
router.post(
  "/create-customer-portal-session",
  createStripeCustomerPortalSession,
);
router.post("/create-checkout-session", createStripeCheckoutSession);

/* Stripe webhooks */

export default router;
