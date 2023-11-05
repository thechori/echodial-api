import { Router } from "express";
//
import db from "../utils/db";
import twilioClient from "../services/twilio";
import { extractErrorMessage } from "../utils/error";
import numbers from "../configs/numbers";
import { CallerId } from "../types";
import {
  isValidPhoneNumberForDb,
  transformPhoneNumberForDb,
} from "../utils/validators/phone";
import envConfig from "../configs/env";

const router = Router();

// Returns all of the verified, user-owned outgoing caller ids from Twilio directly
router.get("/verified", (req, res) => {
  twilioClient.outgoingCallerIds
    .list()
    .then((callerIds) => {
      res.status(200).send(callerIds);
    })
    .catch((e: unknown) => {
      res.status(500).send(extractErrorMessage(e));
    });
});

// Returns all of the Twilio-owned outgoing caller ids from Twilio directly
router.get("/twilio", (req, res) => {
  twilioClient.incomingPhoneNumbers
    .list()
    .then((incomingPhoneNumbers) => {
      res.status(200).send(incomingPhoneNumbers);
    })
    .catch((e: unknown) => {
      res.status(500).send(extractErrorMessage(e));
    });
});

// Return user-owned Caller IDs
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    const caller_ids = await db<CallerId>("caller_id").where("user_id", id);
    return res.status(200).send(caller_ids);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Creates a new verified outgoing caller id
router.post("/", async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "Missing `phone_number` field" });
  }

  // Trim and strip all non-numeric characters
  const phoneNumberForDb = transformPhoneNumberForDb(phone_number);

  if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
    return res.status(400).send("Phone number is not valid");
  }

  // Hit Twilio API
  // Note: We do NOT use .outgoingCallerIds.create() -- this does not exist (very confusing, IMO)
  let validationRequest;
  try {
    validationRequest = await twilioClient.validationRequests.create({
      phoneNumber: phoneNumberForDb,
      friendlyName: res.locals.jwt_decoded.email, // Setting `email` as `friendlyName` for ease of observation in Twilio dashboard
    });

    // Send SMS to `validationRequest.phoneNumber` to give them the confirmation code to use within the Twilio phone call
    console.log(
      `sending validation code (${validationRequest.validationCode}) to ${phoneNumberForDb}`
    );
    twilioClient.messages.create({
      body: `Validation code: ${validationRequest.validationCode}`,
      from: numbers.echoDialSmsSender,
      to: phoneNumberForDb,
      messagingServiceSid: envConfig.messagingServiceSid,
    });
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }

  if (!validationRequest)
    return res.status(400).send("Validation request object missing.");

  const { id } = res.locals.jwt_decoded;

  // Store info in DB
  const newCallerId: Omit<CallerId, "id" | "created_at" | "updated_at"> = {
    phone_number: phoneNumberForDb,
    user_id: id,
    twilio_sid: validationRequest.callSid, // TODO: Have a bad feeling this SID won't be usable and we'll have to do some manual matching AFTER the validation request has fulfilled and the proper SID has been assined to the entity
  };

  try {
    await db<CallerId>("caller_id").insert(newCallerId);
    return res.status(200).send();
  } catch (e) {
    return res.status(500).json({ message: extractErrorMessage(e) });
  }
});

// TODO: Add logic to check if the user owns the number BEFORE allowing them to delete
// We do not want people deleting Caller IDs that don't belong to them
//
// Delete FIRST from Twilio AND THEN from our DB
router.post("/delete", async (req, res) => {
  const { id, phone_number } = req.body;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  } else if (phone_number === null) {
    return res.status(400).send("Missing `twilio_sid` field");
  }

  let twilio_sid_found: string | undefined;

  // Fetch Twilio Caller IDs
  try {
    const outgoingCallerIds = await twilioClient.outgoingCallerIds.list();
    console.log("outgoingCallerIds", outgoingCallerIds);
    const callerIdMatch = outgoingCallerIds.find(
      (cid) => cid.phoneNumber === phone_number
    );
    if (!callerIdMatch)
      throw "No caller id record found with that phone number";
    twilio_sid_found = callerIdMatch.sid;
    console.log("sid found: ", twilio_sid_found);
  } catch (e) {
    console.error(e);
    // Note: Opting not to send response just yet to check for a stale entry
    // in the DB which we can clear out in the following step
  }

  // Delete Twilio Caller ID (if an SID was found)
  if (twilio_sid_found) {
    try {
      const a = await twilioClient.outgoingCallerIds(twilio_sid_found).remove();
      console.log("a", a);
    } catch (e) {
      console.error(e);
      // Note: Opting not to send response just yet to check for a stale entry
      // in the DB which we can clear out in the following step
    }
  }

  // Delete EchoDial Caller ID
  try {
    const dbResult = await db<CallerId>("caller_id").del().where("id", id);
    return res.status(200).send(dbResult);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
