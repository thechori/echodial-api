import { Router, request } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
//
import tokenGenerator from "../utils/twilio/token-generator";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/", (req, res) => res.send("ok"));

router.post("/", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(voiceResponse(req.body));
});

function voiceResponse(requestBody: any) {
  const toNumberOrClientName = requestBody.To;
  const callerId = requestBody.From;
  const identity = requestBody.Identity;

  let twiml = new VoiceResponse();

  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  if (toNumberOrClientName == callerId) {
    let dial = twiml.dial();

    // This will connect the caller with your Twilio.Device/client
    dial.client(identity);
  } else if (requestBody.To) {
    // This is an outgoing call

    // set the callerId
    let dial = twiml.dial({ callerId });

    // Check if the 'To' parameter is a Phone Number or Client Name
    // in order to use the appropriate TwiML noun
    const attr = "number";
    dial[attr]({}, toNumberOrClientName);

    // Store in DB
  } else {
    twiml.say("Thanks for calling!");
  }

  return twiml.toString();
}

// router.post("/", (req, res) => {
//   console.log("req.body", req.body);
//   const { From, To } = req.body;

//   const response = new VoiceResponse();

//   response
//     .dial({
//       callerId: From,
//     })
//     .number(To); // also try "client" if this doesn't work

//   res.set("Content-Type", "text/xml");
//   res.status(200).send(response.toString());
// });

router.get("/token", authMiddleware, (req, res) => {
  res.status(200).send(tokenGenerator());
});

export default router;
