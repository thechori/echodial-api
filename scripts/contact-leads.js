require("dotenv").config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const myPhoneNumber = "+18326460869";
const myTwilioVerified = "";
const myNewFriendswoodNumber = "";

console.log("accountSid: ", accountSid);
console.log("authToken: ", authToken);

const client = require("twilio")(accountSid, authToken);

client.messages
  .create({
    body: "Hello from twilio-node",
    to: myPhoneNumber, // Text your number
    from: "+12812068992", // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));

// WORKS!
// client.calls
// .create({
//   url: "http://demo.twilio.com/docs/voice.xml",
//   to: "+18326460869",
//   // from: "+12813178765",
//   from: "+12812068992",
// })
// .then((call) => console.log(call.sid));
