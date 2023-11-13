import { RequestHandler } from "express";
//
import db from "../../utils/db";
import { extractErrorMessage } from "../../utils/error";
import { User } from "../../types";

export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await db<User>("user");
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: extractErrorMessage(e) });
  }
};
