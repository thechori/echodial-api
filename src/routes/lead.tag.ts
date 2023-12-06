import { Router } from "express";
//
import db from "../utils/db";
import { LeadTag } from "../types";
import { extractErrorMessage } from "../utils/error";
import { createValueFromLabel } from "../utils/helpers/create-value-from-label";

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { label, color } = req.body;

  if (color === null) {
    throw Error("Missing `color` field");
  }
  if (label === null) {
    throw Error("Missing `label` field");
  }

  try {
    const existingRecords = await db<LeadTag>("lead_tag")
      .select()
      .where({ user_id: id, label });
    if (existingRecords.length > 0) {
      throw Error("Tag already exists!");
    }
    const newLeadTag = await db<LeadTag>("lead_tag")
      .insert({
        user_id: id,
        label,
        name: createValueFromLabel(label),
        color,
      })
      .returning("*");

    if (newLeadTag.length !== 1) {
      throw Error("An error occurred when creating the LeadTag record");
    }

    return res.status(200).send(newLeadTag[0]);
  } catch (e) {
    throw Error(extractErrorMessage(e));
  }
});

router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  try {
    const leadTags: LeadTag[] = await db("lead_tag")
      .where("user_id", id)
      .select(
        "lead_tag.id as id",
        "lead_tag.user_id as user_id",
        "lead_tag.name as name",
        "lead_tag.label as label",
        "lead_tag.color as color"
      );
    return res.status(200).send(leadTags);
  } catch (e) {
    throw Error(extractErrorMessage(e));
  }
});

router.delete("/:name", async (req, res) => {
  const { name } = req.params;
  const { id } = res.locals.jwt_decoded;

  if (name === null) {
    return res.status(400).send("Missing `name` field");
  }

  try {
    const deletionResult = await db<LeadTag>("lead_tag")
      .del()
      .where({ user_id: id, name });
    return res.status(200).send("Successfully deleted!");
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});
export default router;

router.put("/:tag_id", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { tag_id } = req.params;
  const { label, color } = req.body;
  try {
    const existingRecords = await db<LeadTag>("lead_tag")
      .select()
      .where({ user_id: id, label });
    if (existingRecords.length > 0) {
      throw Error("Tag already exists!");
    }
    const updatedTag = await db<LeadTag>("lead_tag")
      .where("id", parseInt(tag_id))
      .update({
        label,
        color,
        name: createValueFromLabel(label),
      })
      .returning("*");
    if (updatedTag.length !== 1) {
      return res.status(400).send({
        message:
          "An issue occurred when attempting to update the single Lead Tag entry. Check the ID and try again",
      });
    }
    return res.status(200).send("Successfully updated the tag!");
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});
