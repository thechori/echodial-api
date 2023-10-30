import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadCustomProperty } from "../types";

const router = Router();

// Return LeadCustomProperty items
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    // Only return custom properties that have been created by the specific user
    const leadCustomProperties: LeadCustomProperty[] = await db(
      "lead_custom_property"
    ).where("user_id", id);
    return res.status(200).send(leadCustomProperties);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Create new item
// {
//   label //
//   value // API creates based on label passed - spaces as delimiters
//   description?
// }
router.post("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
