import { Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { Call } from "../types";

const router = Router();

// Return user-owned Calls
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    const calls = await db("call").where("user_id", id);
    console.log("calls", calls);
    return res.status(200).send(calls);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
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

  const newCallContent: Partial<Call> = {
    user_id: id,
    lead_id,
    from_number,
    to_number,
    twilio_call_sid,
  };

  try {
    const newCall = await db("call").insert(newCallContent).returning("*");

    if (newCall.length !== 1) {
      return res.status(400).send({
        message: "An error occurred when creating a single new Call record",
      });
    }

    // Increment call_count for Lead
    await db("lead").where({ id: lead_id }).increment("call_count", 1);

    return res.status(200).send(newCall[0]);
  } catch (e) {
    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// Update Call record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const updatedCall = await db("call")
      .where("id", id)
      .first()
      .update(body)
      .returning("*");

    if (updatedCall.length !== 1) {
      return res
        .status(400)
        .send({ message: "An error occurred when trying to update the call" });
    }

    return res.status(200).send(updatedCall[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// End a Call
router.get("/:id/end", async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send({ message: "Missing `id` field" });
  }

  try {
    const endedCall = await db("call")
      .where("id", id)
      .update({
        disconnected_at: new Date(),
        status: "Ended",
      })
      .returning("*");

    if (endedCall.length !== 1) {
      return res
        .status(400)
        .send({ message: "An error occurred when trying to end the call" });
    }

    return res.status(200).send(endedCall[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Update Call record via Twilio Call SID (useful for updates made while Call is active)
router.put("/twilio-call-sid/:twilio_call_sid", async (req, res) => {
  const { twilio_call_sid } = req.params;
  const { body } = req;

  try {
    const updatedCall = await db("call")
      .where("twilio_call_sid", twilio_call_sid)
      .first()
      .update(body)
      .returning("*");

    if (updatedCall.length !== 1) {
      return res.status(400).send({
        message: "An error occurred when updating the single call record",
      });
    }

    return res.status(200).send(updatedCall[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Delete Call record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const deletedCall = await db("caller_id")
      .where("id", id)
      .first()
      .del()
      .returning("*");

    if (deletedCall.length !== 1) {
      return res.status(400).send({
        message:
          "An error occurred when trying to delete the single call record",
      });
    }

    return res.status(200).send(deletedCall[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
