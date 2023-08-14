import { Router } from "express";
//
import db from "../utils/db";
import twilioClient from "../services/twilio";
import { extractErrorMessage } from "../utils/error";
import numbers from "../configs/numbers";
import { Call, CallerId } from "../types";
import {
  isValidPhoneNumberForDb,
  transformPhoneNumberForDb,
} from "../utils/validators/phone";
import twilioConfig from "../configs/twilio";

const router = Router();

// Return all Calls
router.get("/", async (req, res) => {
  try {
    const calls = await db("call");
    return res.status(200).send(calls);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Return user-owned Calls
router.get("/mine", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    const calls = await db("call").where("user_id", id);
    return res.status(200).send(calls);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Create new Call record
router.post("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { from_number, to_number, lead_id } = req.body;

  if (from_number === null) {
    return res.status(400).json({ message: "Missing `from` field" });
  } else if (to_number === null) {
    return res.status(400).json({ message: "Missing `to` field" });
  } else if (lead_id === null) {
    return res.status(400).json({ message: "Missing `lead_id` field" });
  }

  const newCall: Partial<Call> = {
    user_id: id,
    lead_id,
    from_number,
    to_number,
  };

  try {
    await db("call").insert(newCall);
    return res.status(200).send("Successfully created new Call");
  } catch (e) {
    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// TODO: Prevent Users from editing Calls they did not make
// Update Call record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  console.log("body", body);

  try {
    const a = await db("call").where("id", id).update(body);
    console.log("a", a);
    return res.status(200).send(a);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Delete Call record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const b = await db("caller_id").del().where("id", id);
    console.log("b", b);
    return res.status(200).send("Successfully deleted caller id");
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

export default router;
