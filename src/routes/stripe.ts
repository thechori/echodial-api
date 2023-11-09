import { Router } from "express";
//
import { getStripeCustomers } from "../controllers/stripe/get-customers";
import { getStripeSubscriptions } from "../controllers/stripe/get-subscriptions";
import { getStripeProducts } from "../controllers/stripe/get-products";
import { getSubscriptionStatus } from "../controllers/stripe/get-subscription-status";

const router = Router({ mergeParams: true });

// Return LeadPropertyGroup items
router.get("/customers", getStripeCustomers); // TODO: lock this down to super users
router.get("/subscriptions", getStripeSubscriptions); // TODO: lock this down to super users
router.get("/products", getStripeProducts); // TODO: lock this down to super users
router.get("/subscription-status", getSubscriptionStatus);

export default router;
