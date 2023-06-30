const client = require("../lib/twilio/client");
const numbers = require("../config/numbers");

function sendText(toNumber) {
  client.messages
    .create({
      body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
      to: toNumber,
      from: numbers.barker,
    })
    .then((message) => console.log(message.sid));
}

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
