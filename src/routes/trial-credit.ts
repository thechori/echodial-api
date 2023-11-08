import { Router } from "express";
//
import { getTrialCredits } from "../controllers/trial-credit/get-trial-credits";
import { deductTrialCredits } from "../controllers/trial-credit/deduct-trial-credits";
import { createTrialCredits } from "../controllers/trial-credit/create-trial-credits";

const router = Router({ mergeParams: true });

router.get("/", getTrialCredits);
router.post("/", createTrialCredits);
router.post("/deduct", deductTrialCredits);

export default router;
