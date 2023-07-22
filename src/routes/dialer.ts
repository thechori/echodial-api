import { Router } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import AccessToken, { VoiceGrant } from "twilio/lib/jwt/AccessToken";
//
// import { isValidPhoneNumber } from "../utils/validators/phone";
import nameGenerator from "../utils/helpers/name-generator";
import twilioConfig from "../configs/twilio";

const router = Router();

function tokenGenerator() {
  const identity = nameGenerator();

  const accessToken = new AccessToken(
    twilioConfig.accountSid,
    twilioConfig.apiKey,
    twilioConfig.apiSecret,
    {
      identity,
    }
  );

  const grant = new VoiceGrant({
    outgoingApplicationSid: twilioConfig.twimlAppSid,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  // Include identity and token in a JSON response
  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
}

function voiceResponse(requestBody: any) {
  const toNumberOrClientName = requestBody.To;

  // const callerId = twilioConfig.callerId;

  let twiml = new VoiceResponse();

  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  // if (toNumberOrClientName == callerId) {
  // let dial = twiml.dial();

  // This will connect the caller with your Twilio.Device/client
  // dial.client(identity); // `identity` is the random generated, human readable word
  // } else if (requestBody.To) {
  // This is an outgoing call

  // set the callerId
  let dial = twiml.dial({
    callerId: requestBody.From,
  });

  dial.number(requestBody.To);

  // Check if the 'To' parameter is a Phone Number or Client Name
  // in order to use the appropriate TwiML noun
  // const attr = isValidPhoneNumber(toNumberOrClientName) ? "number" : "client";
  // dial[attr]({}, toNumberOrClientName);
  // } else {
  //   twiml.say("Thanks for calling!");
  // }

  return twiml.toString();
}

// This endpoint should support the ability to:
// - Handle many different users with different From and To numbers
router.post("/", (req, res) => {
  const { body } = req;

  console.log("req.body", body);
  res.set("Content-Type", "text/xml");
  res.status(200).send(voiceResponse(body));
});

router.get("/token", (req, res) => {
  res.status(200).send(tokenGenerator());
});

export default router;
