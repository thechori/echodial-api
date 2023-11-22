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
import { superUserAuthMiddleware } from "../middlewares/super-user";

const router = Router();

// Returns all of the verified, user-owned outgoing caller ids from Twilio directly
router.get("/verified", superUserAuthMiddleware, (req, res) => {
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
router.get("/twilio", superUserAuthMiddleware, (req, res) => {
  twilioClient.incomingPhoneNumbers
    .list()
    .then((incomingPhoneNumbers) => {
      res.status(200).send(incomingPhoneNumbers);
    })
    .catch((e: unknown) => {
      res.status(500).send(extractErrorMessage(e));
    });
});

// TODO: Remediate tech debt here
// Note: Hacky endpoint for simplicity -- the steps should be broken apart so that we're not always hitting Twilio to check for new numbers (should only be done when updating numbers via Account Settings)
// Return user-owned Caller IDs
router.get("/", async (req, res) => {
  const { id, email } = res.locals.jwt_decoded;

  // First, hit Twilio to get the most up-to-date list of outgoingCallerIds
  const _twilioCallerIds = await twilioClient.outgoingCallerIds.list();

  const twilioCallerIds = _twilioCallerIds.filter(
    (cid) => cid.friendlyName === email,
  );
  if (!twilioCallerIds.length) {
    return res.status(200).json([]);
  }

  // Get local app list
  let appCallerIds = await db<CallerId>("caller_id").where("user_id", id);

  // Identify any discrepancies (Filter by `twilio_sid` === null), make updates to app DB, return new data
  const callerIdsWithNoSid = appCallerIds.filter(
    (acid) => acid.twilio_sid === null,
  );
  if (callerIdsWithNoSid.length) {
    // Found a record that needs a Twilio SID for the outgoingCallerId (let's assume there's just one at index 0 for now)
    const record = callerIdsWithNoSid[0];

    // Identify the match in the `twilioCallerIds`
    const match = twilioCallerIds.find(
      (tcid) => tcid.friendlyName === record.email,
    );
    if (!match)
      throw Error(
        "No matching Twilio outbound caller ID found with email found in database",
      );

    await db<CallerId>("caller_id").where("id", record.id).update({
      twilio_sid: match.sid,
    });

    // Return new results and update variable
    appCallerIds = await db<CallerId>("caller_id").where("user_id", id);
  }

  // Return caller ids
  return res.status(200).send(appCallerIds);
});

// Creates a new verified outgoing caller id
router.post("/request", async (req, res) => {
  const { id, email } = res.locals.jwt_decoded;
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "Missing `phone_number` field" });
  }

  // Trim and strip all non-numeric characters
  const phoneNumberForDb = transformPhoneNumberForDb(phone_number);

  if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
    return res.status(400).send("Phone number is not valid");
  }

  // Handle retried request
  // Check for existing entry in our DB
  const existingRecord = await db<CallerId>("caller_id")
    .where("phone_number", phoneNumberForDb)
    .first();

  // If there is an entry with twilio_sid - let them know this already exists
  if (existingRecord && existingRecord.twilio_sid) {
    return res.status(400).json("This phone number is already verified");
  }

  // Hit Twilio API
  // Note: We do NOT use .outgoingCallerIds.create() -- this does not exist (very confusing, IMO)
  const validationRequest = await twilioClient.validationRequests.create({
    phoneNumber: phoneNumberForDb,
    friendlyName: res.locals.jwt_decoded.email, // Setting `email` as `friendlyName` for ease of observation in Twilio dashboard
  });

  twilioClient.messages.create({
    body: `Validation code: ${validationRequest.validationCode}`,
    from: numbers.echoDialSmsSender,
    to: phoneNumberForDb,
    messagingServiceSid: envConfig.messagingServiceSid,
  });

  if (!validationRequest)
    return res.status(400).send("Validation request object missing.");

  // Store info in DB
  const newCallerId: Omit<CallerId, "id" | "created_at" | "updated_at"> = {
    phone_number: phoneNumberForDb,
    user_id: id,
    email: email,
    twilio_sid: null, // Initialize this as null because we don't have a completed request yet
  };

  // Update or insert depending on if `existingRecord` is null or not
  if (existingRecord) {
    await db<CallerId>("caller_id").update({
      updated_at: new Date(), // Nothing really changed, but we can update the timestamp
    });
  } else {
    await db<CallerId>("caller_id").insert(newCallerId);
  }

  return res.status(200).send();
});

// TODO: Add logic to check if the user owns the number BEFORE allowing them to delete
// We do not want people deleting Caller IDs that don't belong to them
//
// Delete FIRST from Twilio AND THEN from our DB
router.delete("/", async (req, res) => {
  const { phone_number } = req.body;
  const { email } = res.locals.jwt_decoded;

  if (email === null) {
    return res.status(400).send("Missing `email` field");
  } else if (phone_number === null) {
    return res.status(400).send("Missing `phone_number` field");
  }

  let twilio_sid_found: string | undefined;

  // Fetch Twilio Caller IDs
  try {
    const outgoingCallerIds = await twilioClient.outgoingCallerIds.list();
    const callerIdMatch = outgoingCallerIds.find(
      (cid) => cid.phoneNumber === phone_number && cid.friendlyName === email,
    );
    if (!callerIdMatch)
      throw "No caller id record found with that phone number and email";
    twilio_sid_found = callerIdMatch.sid;
  } catch (e) {
    // Note: Opting not to send response just yet to check for a stale entry
    // in the DB which we can clear out in the following step
    console.error(e);
  }

  // Delete Twilio Caller ID (if an SID was found)
  if (twilio_sid_found) {
    try {
      await twilioClient.outgoingCallerIds(twilio_sid_found).remove();
    } catch (e) {
      // Note: Opting not to send response just yet to check for a stale entry
      // in the DB which we can clear out in the following step
      console.error(e);
    }
  }

  // Delete EchoDial Caller ID
  try {
    const dbResult = await db<CallerId>("caller_id")
      .del()
      .where("email", email);
    return res.status(200).send(dbResult);
  } catch (e) {
    console.log("eeee", e);
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

export default router;
