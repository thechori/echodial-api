import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadStandardProperty } from "../types";

const router = Router({ mergeParams: true });

// Return LeadStandardProperty items
router.get("/", async (req, res) => {
  try {
    const leadStandardProperties: LeadStandardProperty[] = await db(
      "lead_standard_property",
    );
    return res.status(200).send(leadStandardProperties);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
