require("dotenv").config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

console.log("getting calls...", accountSid, authToken);

// Callback as first parameter
client.calls.each(function (call) {
  console.log(call.status);
});
