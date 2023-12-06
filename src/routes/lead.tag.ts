import { Router } from "express";
//
import db from "../utils/db";
import { LeadTag } from "../types";
import { extractErrorMessage } from "../utils/error";

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { name, label, color } = req.body;

  if (name === null) {
    throw Error("Missing `name` field");
  }
  if (color === null) {
    throw Error("Missing `color` field");
  }
  if (label === null) {
    throw Error("Missing `label` field");
  }

  try {
    const existingRecords = await db<LeadTag>("lead_tag")
      .select()
      .where({ name });
    if (existingRecords.length > 0) {
      throw Error("Tag already exists!");
    }
    const newLeadTag = await db<LeadTag>("lead_tag")
      .insert({
        user_id: id,
        label,
        name,
        color,
      })
      .returning("*");

    if (newLeadTag.length !== 1) {
      throw Error("An error occurred when creating the LeadTag record");
    }

    return res.status(200).send(newLeadTag[0]);
  } catch (e) {
    if ((e as { code: string }).code === "23505") {
      throw Error("Tag already exists");
    }

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

// router.put("/:name", async (req, res) => {});
router.delete("/:name", async (req, res) => {
  const { name } = req.params;

  if (name === null) {
    return res.status(400).send("Missing `name` field");
  }

  try {
    const deletionResult = await db<LeadTag>("lead_tag")
      .del()
      .where("name", name);
    return res.status(200).send("Successfully deleted!");
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});
export default router;
