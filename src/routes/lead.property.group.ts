import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadPropertyGroup } from "../types";

const router = Router({ mergeParams: true });

// Return LeadPropertyGroup items
router.get("/", async (req, res) => {
  try {
    const leadStandardProperties: LeadPropertyGroup[] = await db(
      "lead_property_group",
    );
    return res.status(200).send(leadStandardProperties);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
