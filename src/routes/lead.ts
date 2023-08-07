import { Request, Response, Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const leads = await db("lead");
  res.status(200).send(leads);
});

// Handle the creation of one Lead at a time via manual input
router.post("/", async (req, res) => {
  const { email, phone, first_name, last_name } = req.body;

  if (!phone) {
    return res.status(400).send("New lead must have at least a phone number");
  }

  try {
    const newLead = await db("lead").insert({
      email,
      phone: `+!${phone}`, // Note: Hardcoding country code for best UX
      first_name,
      last_name,
    });

    return res.status(200).send(newLead);
  } catch (error) {
    return res.status(500).send(extractErrorMessage(error));
  }
});

// Handle the bulk upload of Leads via CSV files
router.post("/csv", (req, res) => {});

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
