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
      res.status(200).json(callerIds);
    })
    .catch((e: unknown) => {
      res.status(500).json(extractErrorMessage(e));
    });
});

// Returns all of the Twilio-owned outgoing caller ids from Twilio directly
router.get("/twilio", superUserAuthMiddleware, (req, res) => {
  twilioClient.incomingPhoneNumbers
    .list()
    .then((incomingPhoneNumbers) => {
      res.status(200).json(incomingPhoneNumbers);
    })
    .catch((e: unknown) => {
      res.status(500).json(extractErrorMessage(e));
    });
});

// TODO: Remediate tech debt here
// Note: Hacky endpoint for simplicity -- the steps should be broken apart so that we're not always hitting Twilio to check for new numbers (should only be done when updating numbers via Account Settings)
// Return user-owned Caller IDs
router.get("/", async (req, res) => {
  const { email } = res.locals.jwt_decoded;

  // First, hit Twilio to get the most up-to-date list of outgoingCallerIds
  const allTwilioCallerIds = await twilioClient.outgoingCallerIds.list();

  // Only show user's numbers
  const userTwilioCallerIds = allTwilioCallerIds.filter(
    (cid) => cid.friendlyName === email,
  );

  // Handle no records found
  if (!userTwilioCallerIds.length) {
    return res.status(200).json([]);
  }

  // Get local app list
  let appUserCallerIds = await db<CallerId>("caller_id").where("email", email);

  // Identify any discrepancies (Filter by `twilio_sid` === null), make updates to app DB, return new data
  const appUserCallerIdsWithNoTwilioSid = appUserCallerIds.filter(
    (acid) => acid.twilio_sid === null,
  );

  if (appUserCallerIdsWithNoTwilioSid.length) {
    // Found a record that needs a Twilio SID for the outgoingCallerId (let's assume there's just one at index 0 for now -- they can't really have two open at once)
    const appRecordWithoutTwilioSid = appUserCallerIdsWithNoTwilioSid[0];

    // Identify the match in the `userTwilioCallerIds`
    const match = userTwilioCallerIds.find(
      (tcid) =>
        tcid.friendlyName === appRecordWithoutTwilioSid.email &&
        tcid.phoneNumber === appRecordWithoutTwilioSid.phone_number,
    );

    if (match) {
      // Update twilio_sid
      await db<CallerId>("caller_id")
        .where("id", appRecordWithoutTwilioSid.id)
        .update({
          twilio_sid: match.sid,
          updated_at: new Date(),
        });
    } else {
      console.error(
        "No matching Twilio outbound caller ID found with email found in database",
      );
    }

    // Return new results
    appUserCallerIds = await db<CallerId>("caller_id").where("email", email);
  }

  // Return caller ids
  return res.status(200).json(appUserCallerIds);
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
    return res.status(400).json("Phone number is not valid");
  }

  // Handle retried request
  // Check for existing entry in our DB
  const existingRecord = await db<CallerId>("caller_id")
    .where({
      email,
      phone_number: phoneNumberForDb,
    })
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
    return res.status(400).json("Validation request object missing.");

  // Store info in DB
  const newCallerId: Omit<CallerId, "id" | "created_at" | "updated_at"> = {
    phone_number: phoneNumberForDb,
    user_id: id,
    email: email,
    twilio_sid: null, // Initialize this as null because we don't have a completed request yet
  };

  // Update or insert depending on if `existingRecord` is null or not
  if (existingRecord) {
    await db<CallerId>("caller_id")
      .where({
        email,
        phone_number,
      })
      .update({
        updated_at: new Date(), // Nothing really changed, but we can update the timestamp
      });
  } else {
    await db<CallerId>("caller_id").insert(newCallerId);
  }

  return res.status(200).json();
});

// TODO: Add logic to check if the user owns the number BEFORE allowing them to delete
// We do not want people deleting Caller IDs that don't belong to them
//
// Delete FIRST from Twilio AND THEN from our DB
router.delete("/", async (req, res) => {
  const { phone_number } = req.body;
  const { email } = res.locals.jwt_decoded;

  if (email === null) {
    return res.status(400).json("Missing `email` field");
  } else if (phone_number === null) {
    return res.status(400).json("Missing `phone_number` field");
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
      .where({
        email,
        phone_number,
      })
      .del();
    return res.status(200).json(dbResult);
  } catch (e) {
    return res.status(500).json(extractErrorMessage(e));
  }
});

export default router;
