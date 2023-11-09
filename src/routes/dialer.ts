import { Router } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
//
import tokenGenerator from "../utils/twilio/token-generator";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Generate and return the token for Twilio
router.get("/token", authMiddleware, (req, res) => {
  res.status(200).send(tokenGenerator(res.locals.jwt_decoded.id));
});

// Main endpoint for TWimL App which powers the dialer
router.post("/", async (req, res) => {
  // Send response immediately
  res.set("Content-Type", "text/xml");
  res.send(voiceResponse(req.body));
});

function voiceResponse(requestBody: any) {
  const toNumberOrClientName = requestBody.To;
  const callerId = requestBody.From;
  const identity = requestBody.Identity;

  const twiml = new VoiceResponse();

  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  if (toNumberOrClientName == callerId) {
    const dial = twiml.dial();

    // This will connect the caller with your Twilio.Device/client
    dial.client(identity);
  } else if (requestBody.To) {
    // This is an outgoing call

    // set the callerId
    const dial = twiml.dial({ callerId, answerOnBridge: true });

    // Check if the 'To' parameter is a Phone Number or Client Name
    // in order to use the appropriate TwiML noun
    const attr = "number";
    dial[attr]({}, toNumberOrClientName);
  } else {
    twiml.say("Thanks for calling!");
  }

  return twiml.toString();
}

export default router;
