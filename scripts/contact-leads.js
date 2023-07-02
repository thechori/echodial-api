require("dotenv").config();

const client = require("../lib/twilio");
const numbers = require("../config/numbers");
const { addMinutes } = require("date-fns");

function sendText(toNumber) {
  // Add 1 minute to Date.now()
  // Note: might need to crank this up to 15 per the docs
  const scheduledTime = addMinutes(Date.now(), 16);

  client.messages
    .create({
      body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
      to: toNumber,
      from: numbers.barker,

      // This service seems flawed, keeps sending two... build your own for simplicity
      // scheduleType: "fixed",
      // sendAt: scheduledTime,
      // messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    })
    .then((message) => console.log(message.sid));
}

// sendText("+18326460869");
exports.sendText = sendText;

// WORKS!
// client.calls
// .create({
//   url: "http://demo.twilio.com/docs/voice.xml",
//   to: "+18326460869",
//   // from: "+12813178765",
//   from: "+12812068992",
// })
// .then((call) => console.log(call.sid));
