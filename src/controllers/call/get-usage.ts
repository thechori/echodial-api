import db from "../../utils/db";
import { CallerId } from "../../types";
import { Request, Response } from "express";
import twilioClient from "../../services/twilio";

// We can query the `From` number in order to filter Call records
export const getCallUsage = async (req: Request, res: Response) => {
  // Extract Call ID
  const { id } = res.locals.jwt_decoded;

  // Pagination details - use `client.page` instead of `client.list` to support this
  // const { page_number, page_size } = req.params
  const { start_time, end_time } = req.query;

  const startTime = start_time ? new Date(start_time as string) : undefined;
  const endTime = end_time ? new Date(end_time as string) : undefined;

  // TODO: support multiple caller ids
  // Get all Caller IDs associated with user id

  const callerId = await db<CallerId>("caller_id").where("user_id", id).first();

  if (!callerId) {
    throw Error("No caller ID found");
  }

  // Find all Twilio Call records using the From number in the CallerId
  const calls = await twilioClient.calls.list({
    from: callerId.phone_number,
    startTimeAfter: startTime,
    endTimeBefore: endTime,
  });

  return res.status(200).send(calls);
};
