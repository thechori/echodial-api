import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadCustomProperty } from "../types";
import { createValueFromLabel } from "../utils/helpers/create-value-from-label";

const router = Router({ mergeParams: true });

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
  const {
    lead_property_group_id,
    lead_property_type_id,
    name,
    label,
    description,
  } = req.body;

  /* Check for required fields */

  if (lead_property_group_id === null) {
    return res
      .status(400)
      .send({ message: "Missing `lead_property_group_id` field" });
  }
  if (lead_property_type_id === null) {
    return res
      .status(400)
      .send({ message: "Missing `lead_property_type_id` field" });
  }
  if (label === null) {
    return res.status(400).send({ message: "Missing `label` field" });
  }

  try {
    const newLeadCustomProperty = await db("lead_custom_property").insert({
      user_id: id,
      id,
      lead_property_group_id,
      lead_property_type_id,
      label,
      name: createValueFromLabel(label),
      description,
    });

    return res.status(200).send(newLeadCustomProperty);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
