import { Request, Response, Router } from "express";
//
import db from "../utils/db";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const leads = await db("lead");
  res.status(200).send(leads);
});

router.get("/pretty", async (req: Request, res: Response) => {
  const leads = await db("lead")
    .join("person", "person_id", "person.id")
    .join("campaign", "campaign_id", "campaign.id")
    .select(
      "lead.id",
      "lead.created_at",
      "lead.body as message",
      "person.phone as person_phone",
      "campaign.name as campaign_name"
    );
  res.status(200).send(leads);
});

export default router;
