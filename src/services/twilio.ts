import Twilio from "twilio/lib/rest/Twilio";
import twilioConfig from "../configs/twilio";

const twilioClient: Twilio = require("twilio")(
  twilioConfig.accountSid,
  twilioConfig.authToken
);

export default twilioClient;
