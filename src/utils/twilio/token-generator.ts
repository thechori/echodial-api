import AccessToken, { VoiceGrant } from "twilio/lib/jwt/AccessToken";
//
import twilioConfig from "../../configs/twilio";
import nameGenerator from "./name-generator";

function tokenGenerator() {
  const identity = nameGenerator();

  const accessToken = new AccessToken(
    twilioConfig.accountSid,
    twilioConfig.apiKey,
    twilioConfig.apiSecret,
    {
      identity,
    }
  );

  const grant = new VoiceGrant({
    outgoingApplicationSid: twilioConfig.twimlAppSid,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  // Include identity and token in a JSON response
  return {
    identity: identity,
    token: accessToken.toJwt(),
  };
}

export default tokenGenerator;
