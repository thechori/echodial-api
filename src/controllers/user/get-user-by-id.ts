import { Request, Response } from "express";
//
import db from "../../utils/db";
import { extractErrorMessage } from "../../utils/error";
import { User } from "../../types";

export const getUserByID = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const users = await db<User>("user").where("id", id);
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: extractErrorMessage(e) });
  }
};
