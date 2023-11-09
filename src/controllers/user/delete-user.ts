import { Request, Response } from "express";
//
import db from "../../utils/db";
import { User } from "../../types";

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = res.locals.jwt_decoded;

  // TODO: Delete all associated records (for now, we can leave these hanging around)
  // [ ] Call
  // [ ] CallerId
  // [ ] Lead
  // [ ] LeadCustomProperty
  // [ ] Bucket
  // [ ] BucketLead

  // Delete User record based on id
  await db<User>("user").where("id", id).delete();

  if (!deleteUser)
    throw Error(
      "There was a problem deleting the user account. Please try again or contact our support team.",
    );

  res.status(200).send("👋");
};
