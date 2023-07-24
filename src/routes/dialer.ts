import { Router } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import AccessToken, { VoiceGrant } from "twilio/lib/jwt/AccessToken";
//
// import { isValidPhoneNumber } from "../utils/validators/phone";
import nameGenerator from "../utils/helpers/name-generator";
import twilioConfig from "../configs/twilio";
import twilioClient from "../services/twilio";

let activeCallSids: string[] = [];

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

  dial.number(toNumberOrClientName);

  // Check if the 'To' parameter is a Phone Number or Client Name
  // in order to use the appropriate TwiML noun
  // const attr = isValidPhoneNumber(toNumberOrClientName) ? "number" : "client";
  // dial[attr]({}, toNumberOrClientName);
  // } else {
  //   twiml.say("Thanks for calling!");
  // }

  return twiml.toString();
}

router.post("/call", (req, res) => {
  const { From, To } = req.body;

  twilioClient.calls
    .create({
      twiml: `
      <Response>
        <Say>Hey! It's Victor. Can you hear me okay?</Say>
        <Pause length="30" />
      </Response>
    `,
      from: From,
      to: To,
    })
    .then((call) => console.log(call.sid));
});

// Take an
router.post("/transfer", (req, res) => {
  const { call_sid } = req.body;

  twilioClient
    .calls(call_sid)
    .update({ method: "POST", url: "http://demo.twilio.com/docs/voice.xml" })
    .then((call) => console.log(call.to));
});

// Works
router.get("/active-calls", async (req, res) => {
  const calls = await twilioClient.calls.list({ status: "in-progress" });
  return res.status(200).send(calls);
});

router.get("/active-call-sids", (req, res) => {
  return res.status(200).send(activeCallSids);
});
router.post("/active-call-sids", (req, res) => {
  const { call_sid } = req.body;
  if (!call_sid) {
    return res.status(400).send("missing call_sid");
  }
  activeCallSids.push(call_sid);
  return res.status(200).send(activeCallSids);
});
router.delete("/active-call-sids/:call_sid", (req, res) => {
  const { call_sid } = req.params;
  if (!call_sid) {
    return res.status(400).send("missing call_sid");
  }
  let indexFound = activeCallSids.indexOf(call_sid);
  if (indexFound === -1) {
    return res.status(400).send("call_sid not found");
  }
  activeCallSids.splice(indexFound, 1);
  return res.status(200).send(activeCallSids);
});

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
