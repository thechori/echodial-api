import { RequestHandler } from "express";
//
import db from "../../utils/db";
import { User } from "../../types";

export const getUserByID: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    res.status(400);
    throw Error("Missing `id` field");
  }

  const users = await db<User>("user").where("id", id);
  return res.json(users);
};
