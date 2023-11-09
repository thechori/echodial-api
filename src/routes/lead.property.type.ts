import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadPropertyType } from "../types";

const router = Router({ mergeParams: true });

// Return LeadPropertyType items
router.get("/", async (req, res) => {
  try {
    const leadStandardProperties: LeadPropertyType[] =
      await db("lead_property_type");
    return res.status(200).send(leadStandardProperties);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
