require("dotenv").config();

import numbers from "./numbers";

const twilioConfig = {
  accountSid: "",
  authToken: "",
  twimlAppSid: "",
  callerId: "",
  apiKey: "",
  apiSecret: "",
};

const {
  PORT,
  TWILIO_SID,
  TWILIO_TWIML_APP_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_AUTH_TOKEN,
} = process.env;

if (
  !PORT ||
  !TWILIO_SID ||
  !TWILIO_TWIML_APP_SID ||
  !TWILIO_API_KEY ||
  !TWILIO_API_SECRET ||
  !TWILIO_AUTH_TOKEN
) {
  throw "missing field from .env file";
}

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
twilioConfig.accountSid = TWILIO_SID;
twilioConfig.authToken = TWILIO_AUTH_TOKEN;

twilioConfig.twimlAppSid = TWILIO_TWIML_APP_SID;
twilioConfig.callerId = numbers.barker; // FROM number

twilioConfig.apiKey = TWILIO_API_KEY;
twilioConfig.apiSecret = TWILIO_API_SECRET;

// Export configuration object
export default twilioConfig;
