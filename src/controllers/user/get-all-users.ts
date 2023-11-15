import { RequestHandler } from "express";
//
import db from "../../utils/db";
import { User } from "../../types";

export const getAllUsers: RequestHandler = async (req, res) => {
  const users = await db<User>("user");
  return res.json(users);
};
