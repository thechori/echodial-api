import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { LeadCustomProperty, LeadStandardProperty } from "../types";
import { createValueFromLabel } from "../utils/helpers/create-value-from-label";

const router = Router({ mergeParams: true });
// Return LeadCustomProperty items
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    // Only return custom properties that have been created by the specific user
    const leadCustomProperties: LeadCustomProperty[] = await db(
      "lead_custom_property",
    )
      .where("user_id", id)
      .join(
        "lead_property_group",
        "lead_property_group_id",
        "lead_property_group.id",
      )
      .join(
        "lead_property_type",
        "lead_property_type_id",
        "lead_property_type.id",
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
        "lead_property_type.name as lead_property_type_name",
      );
    return res.status(200).send(leadCustomProperties);
  } catch (e) {
    throw Error(extractErrorMessage(e));
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
    throw Error("Missing `lead_property_group_id` field");
  }
  if (lead_property_type_id === null) {
    throw Error("Missing `lead_property_type_id` field");
  }
  if (label === null) {
    throw Error("Missing `label` field");
  }

  try {
    const existingRecords = await db<LeadStandardProperty>(
      "lead_standard_property",
    )
      .select()
      .where({ name: createValueFromLabel(label) });
    if (existingRecords.length > 0) {
      throw Error("Property already exists!");
    }
    const newLeadCustomProperty = await db<LeadCustomProperty>(
      "lead_custom_property",
    )
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
      throw Error(
        "An error occurred when creating the LeadCustomProperty record",
      );
    }

    return res.status(200).send(newLeadCustomProperty[0]);
  } catch (e) {
    if ((e as { code: string }).code === "23505") {
      throw Error("Property already exists");
    }

    throw Error(extractErrorMessage(e));
  }
});

// Delete a Custom Property
router.delete("/:name", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { name } = req.params;
  try {
    // Check if the LeadCustomProperty exists
    const existingLeadCustomProperty = await db<LeadCustomProperty>(
      "lead_custom_property",
    )
      .where({ user_id: id, name })
      .first();

    if (!existingLeadCustomProperty) {
      throw Error("LeadCustomProperty not found");
    }

    // Delete the LeadCustomProperty
    await db<LeadCustomProperty>("lead_custom_property")
      .where({ user_id: id, name })
      .del();

    return res.status(200).json({ message: "Successfully deleted!" });
  } catch (e) {
    throw Error("There was an error deleting the property");
  }
});

export default router;
