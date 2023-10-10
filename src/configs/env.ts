require("dotenv").config();

import numbers from "./numbers";

// Init object
const envConfig = {
  port: "",
  clientHost: "",
  accountSid: "",
  authToken: "",
  twimlAppSid: "",
  callerId: "",
  apiKey: "",
  apiSecret: "",
  messagingServiceSid: "",
};

// Extract from runtime environment
const {
  PORT,
  CLIENT_HOST,
  TWILIO_SID,
  TWILIO_TWIML_APP_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID,
} = process.env;

// Handle missing values
if (
  !CLIENT_HOST ||
  !PORT ||
  !TWILIO_SID ||
  !TWILIO_TWIML_APP_SID ||
  !TWILIO_API_KEY ||
  !TWILIO_API_SECRET ||
  !TWILIO_AUTH_TOKEN ||
  !TWILIO_MESSAGING_SERVICE_SID
) {
  throw "missing field from .env file";
}

// Assignments
envConfig.clientHost = CLIENT_HOST;
envConfig.port = PORT;

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
envConfig.accountSid = TWILIO_SID;
envConfig.authToken = TWILIO_AUTH_TOKEN;

envConfig.twimlAppSid = TWILIO_TWIML_APP_SID;
envConfig.callerId = numbers.echoDialSmsSender; // FROM number
envConfig.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID; // FROM number

envConfig.apiKey = TWILIO_API_KEY;
envConfig.apiSecret = TWILIO_API_SECRET;

// Export configuration object
export default envConfig;
