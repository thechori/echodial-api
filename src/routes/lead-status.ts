import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadStatus } from "../types";

const router = Router();

// Return lead statuses
router.get("/", async (req, res) => {
  try {
    const leadStatuses: LeadStatus[] = await db("lead_status");
    return res.status(200).send(leadStatuses);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
