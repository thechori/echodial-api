require("dotenv").config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log("accountSid: ", accountSid);
console.log("authToken: ", authToken);

const client = require("twilio")(accountSid, authToken);

client.messages
  .create({
    body: "Hello from twilio-node",
    to: "+18326460869", // Text your number
    from: "+12812068992", // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
