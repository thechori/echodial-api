import { Router } from "express";
import { twiml } from "twilio";
//
// import db from "../utils/db";
// import { extractErrorMessage } from "../utils/error";
// import { Call, Lead } from "../types";
// import { getCallUsage } from "../controllers/call/get-usage";
import twilioClient from "../services/twilio";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// AMD callback
router.post("/callback", async (req, res) => {
  // exports.handler = function(context, event, callback) {
  console.log("req.body", req.body);

  res.send();
  // check AnsweredBy and update call with new twiml
  // If human, play greeting. Add <Dial> to forward to another number
  // if (event.AnsweredBy == "human") {
  //   twilioClient.calls(event.CallSid)
  //     .update({url: '<YOUR_ASYNC_AMD_ANSWER_HUMAN_URL>'})
  //     .then((result) => {
  //     console.log('Call answered and successfully updated');
  //     return callback(null, 'success');
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return callback(error);
  //   });
  // }
  // // else update call with voicemail message
  // else {
  //   twilioClient.calls(event.CallSid)
  //     .update({url: '<YOUR_ASYNC_AMD_ANSWER_VOICEMAIL_URL>'})
  //     .then((result) => {
  //     console.log('Call to voicemail successfully updated');
  //     return callback(null, 'success');
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return callback(error);
  //   });
  // }
});

router.post("/", authMiddleware, async (req, res) => {
  // const { id } = res.locals.jwt_decoded;
  const { from, to } = req.body;

  const response = new twiml.VoiceResponse();
  response.say("Hello! This is an AMD.");

  const call = await twilioClient.calls.create({
    to: to,
    from: from,
    twiml: response.toString(),
    // machineDetection: "AnsweredBy",
    machineDetection: "Enable",
    asyncAmdStatusCallback:
      "https://4458-2-56-191-162.ngrok-free.app/power-dialer/callback",
  });

  console.log("call: ", call);

  res.status(200).json();
});

export default router;
