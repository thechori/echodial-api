import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadCustomProperty } from "../types";

const router = Router();

// Return LeadCustomProperty items
router.get("/", async (req, res) => {
  try {
    const leadCustomProperties: LeadCustomProperty[] = await db(
      "lead_custom_property"
    );
    return res.status(200).send(leadCustomProperties);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
