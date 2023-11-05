import { Router } from "express";
//
import { getStripeCustomers } from "../controllers/stripe/get-customers";
import { getStripeSubscriptions } from "../controllers/stripe/get-subscriptions";
import { getStripeProducts } from "../controllers/stripe/get-products";

const router = Router({ mergeParams: true });

// Return LeadPropertyGroup items
router.get("/customers", getStripeCustomers);
router.get("/subscriptions", getStripeSubscriptions);
router.get("/products", getStripeProducts);

export default router;
