import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { Bucket } from "../types";

const router = Router();

// Return user-owned Buckets
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    const buckets = await db("bucket").where("user_id", id);
    return res.status(200).send(buckets);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Create new Bucket record
// name, description (optional),
router.post("/", async (req, res) => {
  const { id: user_id } = res.locals.jwt_decoded;
  const { name, description } = req.body;

  if (name === null) {
    return res.status(400).json({ message: "Missing `name` field" });
  }

  const newBucketContent: Partial<Bucket> = {
    name,
    description,
    user_id,
  };

  try {
    const newBucket = await db("bucket")
      .insert(newBucketContent)
      .returning("*");

    if (newBucket.length !== 1) {
      return res.status(400).send({
        message: "An error occurred when creating a single new Bucket record",
      });
    }

    return res.status(200).send(newBucket[0]);
  } catch (e) {
    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// Update Bucket record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const updatedBucket = await db("bucket")
      .where("id", id)
      .first()
      .update({
        ...body,
        updated_at: new Date().toISOString(), // Note: manually doing this because knex does not support it
      })
      .returning("*");

    if (updatedBucket.length !== 1) {
      return res.status(400).send({
        message: "An error occurred when trying to update the bucket",
      });
    }

    return res.status(200).send(updatedBucket[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Delete Bucket record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const deletedBucket = await db("bucket")
      .where("id", id)
      .first()
      .del()
      .returning("*");

    if (deletedBucket.length !== 1) {
      return res.status(400).send({
        message:
          "An error occurred when trying to delete the single bucket record",
      });
    }

    return res.status(200).send(deletedBucket[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
