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
    )
      .where("user_id", id)
      .join(
        "lead_property_group",
        "lead_property_group_id",
        "lead_property_group.id"
      )
      .join(
        "lead_property_type",
        "lead_property_type_id",
        "lead_property_type.id"
      )
      .select(
        "lead_custom_property.id as id",
        "lead_custom_property.user_id as user_id",
        "lead_custom_property.name as name",
        "lead_custom_property.label as label",
        "lead_custom_property.description as description",

        "lead_property_group.id as lead_property_group_id",
        "lead_property_group.name as lead_property_group_name",

        "lead_property_type.id as lead_property_type_id",
        "lead_property_type.name as lead_property_type_name"
      );
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
  const { lead_property_group_id, lead_property_type_id, label, description } =
    req.body;
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
    const existingRecord = await db("lead_custom_property")
    .where("label", label)
    .first();

    if (existingRecord) {
      return res.status(400).send({
        message:
          "This label already exists",
      });
    }
    const newLeadCustomProperty = await db("lead_custom_property")
      .insert({
        user_id: id,
        lead_property_group_id,
        lead_property_type_id,
        label,
        name: createValueFromLabel(label),
        description,
      })
      .returning("*");

    if (newLeadCustomProperty.length !== 1) {
      return res.status(400).send({
        message:
          "An error occurred when creating the LeadCustomProperty record",
      });
    }

    return res.status(200).send(newLeadCustomProperty[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
