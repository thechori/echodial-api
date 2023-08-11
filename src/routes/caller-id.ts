import { Router } from "express";
//
import db from "../utils/db";
import twilioClient from "../services/twilio";
import { extractErrorMessage } from "../utils/error";
import numbers from "../configs/numbers";
import { CallerId } from "../types";

const router = Router();

// Returns all of the verified, user-owned outgoing caller ids from Twilio directly
router.get("/verified", (req, res) => {
  twilioClient.outgoingCallerIds
    .list()
    .then((callerIds) => {
      res.status(200).send(callerIds);
    })
    .catch((error: unknown) => {
      res.status(500).send(extractErrorMessage(error));
    });
});

// Returns all of the Twilio-owned outgoing caller ids from Twilio directly
router.get("/twilio", (req, res) => {
  twilioClient.incomingPhoneNumbers
    .list()
    .then((incomingPhoneNumbers) => {
      res.status(200).send(incomingPhoneNumbers);
    })
    .catch((error: unknown) => {
      res.status(500).send(extractErrorMessage(error));
    });
});

// Return user-owned Caller IDs
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  console.log("user id: ", id);

  try {
    const caller_ids = await db("caller_id").where("user_id", id);
    return res.status(200).send(caller_ids);
  } catch (error) {
    return res.status(500).send(extractErrorMessage(error));
  }
});

// Creates a new verified outgoing caller id
router.post("/", async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "phone_number missing" });
  }

  // Trim and strip all non-numeric characters
  const trimmedVal = phone_number.trim();
  const digits = trimmedVal.replace(/\D/g, "");

  // Hit Twilio API
  // Note: We do NOT use .outgoingCallerIds.create() -- this does not exist (very confusing, IMO)
  let validationRequest;
  try {
    validationRequest = await twilioClient.validationRequests.create({
      phoneNumber: `+1${digits}`, // Note: Hardcoding country code for best UX
      friendlyName: res.locals.jwt_decoded.email, // Setting `email` as `friendlyName` for ease of observation in Twilio dashboard
    });

    // Send SMS to `validationRequest.phoneNumber` to give them the confirmation code to use within the Twilio phone call
    twilioClient.messages.create({
      body: `Validation code: ${validationRequest.validationCode}`,
      from: numbers.l34dsSmsSender,
      to: `+1${digits}`,
    });
  } catch (error) {
    return res.status(500).send(extractErrorMessage(error));
  }

  if (!validationRequest)
    return res.status(400).send("Validation request object missing.");

  const { id } = res.locals.jwt_decoded;

  // Store info in DB
  const newCallerId: Omit<CallerId, "id" | "created_at" | "updated_at"> = {
    phone_number: `+1${digits}`,
    user_id: id,
    twilio_sid: validationRequest.callSid, // TODO: Have a bad feeling this SID won't be usable and we'll have to do some manual matching AFTER the validation request has fulfilled and the proper SID has been assined to the entity
  };

  try {
    await db("caller_id").insert(newCallerId);
    return res.status(200).send();
  } catch (error) {
    return res.status(500).json({ message: extractErrorMessage(error) });
  }
});

// Delete FIRST from Twilio AND THEN from our DB
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const a = await twilioClient.outgoingCallerIds(id).remove();
    console.log("a", a);
    await db("caller_id").del().where("id", id);
    return res.status(200).send("Successfully deleted caller id");
  } catch (error) {
    return res.status(500).send(extractErrorMessage(error));
  }
});

export default router;
