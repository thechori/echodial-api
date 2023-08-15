import AccessToken, { VoiceGrant } from "twilio/lib/jwt/AccessToken";
//
import twilioConfig from "../../configs/twilio";

function tokenGenerator(user_id: number) {
  const user_id_string = user_id.toString();

  const accessToken = new AccessToken(
    twilioConfig.accountSid,
    twilioConfig.apiKey,
    twilioConfig.apiSecret,
    {
      identity: user_id_string,
    }
  );

  const grant = new VoiceGrant({
    outgoingApplicationSid: twilioConfig.twimlAppSid,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);
  // accessToken.

  // Include identity and token in a JSON response
  return {
    identity: user_id_string,
    token: accessToken.toJwt(),
  };
}

export default tokenGenerator;
