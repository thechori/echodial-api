import db from "../../utils/db";
import { Call, CallerId } from "../../types";
import { Request, Response } from "express";
import twilioClient from "../../services/twilio";
import { extractErrorMessage } from "../../utils/error";

// We can query the `From` number in order to
export const getCallUsage = async (req: Request, res: Response) => {
  // Extract Call ID
  const { id } = res.locals.jwt_decoded;

  // TODO: support multiple caller ids
  // Get all Caller IDs associated with user id
  try {
    const callerId = await db<CallerId>("caller_id")
      .where("user_id", id)
      .first();

    console.log("callerId", callerId);

    if (!callerId) {
      return res.status(400).send({ message: "No caller ID found" });
    }

    // Find all Twilio Call records using the From number in the CallerId
    const calls = await twilioClient.calls.list({
      from: callerId.phone_number,
    });
    // .phoneNumbers(callerId.phone_number)
    // .fetch();

    return res.status(200).send(calls);
  } catch (e) {
    return res.status(400).send({ message: extractErrorMessage(e) });
  }
};
