import { Request, Response, Router } from "express";
import { extractErrorMessage } from "../utils/error";
//
import db from "../utils/db";

const router = Router();

router.get("/listing", async (req: Request, res: Response) => {
  try {
    const listings = await db("listing");
    return res.status(200).send(listings);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

router.get("/listing/pretty", async (req: Request, res: Response) => {
  try {
    const listings = await db("listing as l")
      .join("campaign as c", "campaign_id", "c.id")
      .select(
        "l.id as id",
        "l.name",
        "l.description",
        "l.url",
        "c.name as campaign_name"
      );
    return res.status(200).send(listings);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

export default router;
