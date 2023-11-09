import { Request, Response } from "express";
//
import db from "../../utils/db";
import { extractErrorMessage } from "../../utils/error";
import { User } from "../../types";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await db<User>("user");
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: extractErrorMessage(e) });
  }
};
