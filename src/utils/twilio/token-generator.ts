import AccessToken, { VoiceGrant } from "twilio/lib/jwt/AccessToken";
//
import envConfig from "../../configs/env";

function tokenGenerator(user_id: number) {
  const user_id_string = user_id.toString();

  const accessToken = new AccessToken(
    envConfig.accountSid,
    envConfig.apiKey,
    envConfig.apiSecret,
    {
      identity: user_id_string,
    },
  );

  const grant = new VoiceGrant({
    outgoingApplicationSid: envConfig.twimlAppSid,
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
