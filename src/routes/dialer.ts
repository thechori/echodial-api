import { Router } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
//
import twilioClient from "../services/twilio";
import tokenGenerator from "../utils/twilio/token-generator";

const router = Router();

router.post("/call", (req, res) => {
  const { From, To } = req.body;

  twilioClient.calls
    .create({
      twiml: `
      <Response>
        <Say>Welcome! Dialer engaging...</Say>
        <Number></Number>
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

// We call our endpoint from the VOIP browser client
// We pass in the numbers we want to call
// [ ] Greets you
// [ ] Takes an array of `to` numbers
// [ ] Calls them all, connects on answer, hang up on others
router.post("/", (req, res) => {
  console.log("req.body", req.body);
  const { From, To } = req.body;

  // const callerId = twilioConfig.callerId;

  const response = new VoiceResponse();

  response.say("welcome! autodialer initializing...");

  // for (let i = 0; i < toNumbers.length; i++) {
  response.number(To).dial({ callerId: From });
  // response.dial({ "callerId": "", toNumbers[i]);
  // }

  res.set("Content-Type", "text/xml");
  res.status(200).send(response.toString());
});

router.get("/token", (req, res) => {
  res.status(200).send(tokenGenerator());
});

export default router;
