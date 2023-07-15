import { Request, Response, Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";

const router = Router();

router.get("/person", async (req: Request, res: Response) => {
  try {
    const persons = await db("person");
    return res.status(200).send(persons);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

export default router;
