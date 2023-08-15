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
  const { from_number, to_number, lead_id, twilio_call_sid } = req.body;

  if (from_number === null) {
    return res.status(400).json({ message: "Missing `from` field" });
  } else if (to_number === null) {
    return res.status(400).json({ message: "Missing `to` field" });
  } else if (lead_id === null) {
    return res.status(400).json({ message: "Missing `lead_id` field" });
  } else if (twilio_call_sid === null) {
    return res.status(400).json({ message: "Missing `twilio_call_sid` field" });
  }

  const newCall: Partial<Call> = {
    user_id: id,
    lead_id,
    from_number,
    to_number,
    twilio_call_sid,
  };

  try {
    const dbResult = await db("call").insert(newCall);
    return res.status(200).send(dbResult);
  } catch (e) {
    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

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

// Update Call record via Twilio Call SID (useful for updates made while Call is active)
router.put("/twilio-call-sid/:twilio_call_sid", async (req, res) => {
  const { twilio_call_sid } = req.params;
  const { body } = req;
  console.log("body", body);

  try {
    await db("call").where("twilio_call_sid", twilio_call_sid).update(body);
    return res.status(200).send({
      message: `Successfully updated Call with Twilio SID ${twilio_call_sid}`,
    });
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
    const dbResult = await db("caller_id").del().where("id", id);
    return res.status(200).send(dbResult);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

export default router;
