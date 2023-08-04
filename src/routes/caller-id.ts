import { Router } from "express";
//
import twilioClient from "../services/twilio";
import { extractErrorMessage } from "../utils/error";
import numbers from "../configs/numbers";

const router = Router();

// Returns all of the verified outgoing caller ids
router.get("/", (req, res) => {
  // Hit Twilio API
  twilioClient.outgoingCallerIds
    .list()
    .then((callerIds) => {
      console.log(callerIds);
      res.status(200).send(callerIds);
    })
    .catch((error: unknown) => {
      res.status(500).send(extractErrorMessage(error));
    });
});

// Creates a new verified outgoing caller id
router.post("/", (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "phone_number missing" });
  }

  // Hit Twilio API
  // Note: We do NOT use .outgoingCallerIds.create() -- this does not exist (very confusing, IMO)
  twilioClient.validationRequests
    .create({
      phoneNumber: phone_number,
      friendlyName: res.locals.jwt.email, // Setting `email` as `friendlyName` for ease of observation in Twilio dashboard
    })
    .then((validationRequest) => {
      console.log(validationRequest);

      // Send SMS to `validationRequest.phoneNumber` to give them the confirmation code to use within the Twilio phone call
      twilioClient.messages.create({
        body: `Validation code: ${validationRequest.validationCode}`,
        from: numbers.barker,
        to: phone_number,
      });
      res.status(200).send(validationRequest);
    })
    .catch((error: unknown) => {
      res.status(500).send(extractErrorMessage(error));
    });
});

export default router;
