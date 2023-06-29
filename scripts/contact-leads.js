require("dotenv").config();

function sendText(toNumber) {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // const myPhoneNumber = "+18326460869";
  // const myTwilioVerified = "";
  const myNewFriendswoodNumber = "+12812068992";

  console.log("accountSid: ", accountSid);
  console.log("authToken: ", authToken);

  const client = require("twilio")(accountSid, authToken);

  client.messages
    .create({
      body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
      to: toNumber,
      from: myNewFriendswoodNumber,
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
