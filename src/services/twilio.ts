import Twilio from "twilio/lib/rest/Twilio";
import envConfig from "../configs/env";

const twilioClient: Twilio = require("twilio")(
  envConfig.accountSid,
  envConfig.authToken,
);

export default twilioClient;
