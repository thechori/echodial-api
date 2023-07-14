import { Request, Response, Router } from "express";
//
import db from "../utils/db";

const router = Router();

router.get("/lead", async (req: Request, res: Response) => {
  const leads = await db("development.lead");
  res.status(200).send(leads);
});

router.get("/lead/pretty", async (req: Request, res: Response) => {
  const leads = await db("development.lead")
    .join("development.person", "person_id", "person.id")
    .join("development.campaign", "campaign_id", "campaign.id")
    .select(
      "development.lead.id",
      "development.lead.created_at",
      "development.lead.body as message",
      "development.person.phone as person_phone",
      "development.campaign.name as campaign_name"
    );
  res.status(200).send(leads);
});

export default router;
