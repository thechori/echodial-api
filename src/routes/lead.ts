import { Request, Response, Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const leads = await db("lead");
  res.status(200).send(leads);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    await db("lead").del().where("id", id);
    return res.status(200).send("Successfully deleted lead");
  } catch (error) {
    return res.status(500).send(extractErrorMessage(error));
  }
});

router.post("/bulk-delete", async (req, res) => {
  const { ids } = req.body;

  if (!ids) {
    return res.status(400).send("Missing `ids` field (or malformed)");
  }

  try {
    const a = await db("lead").whereIn("id", ids).del();
    console.log("a", a);
    return res.status(200).send(`Successfully deleted ${a} lead(s)`);
  } catch (error) {
    return res.status(500).send(extractErrorMessage(error));
  }
});

// Handle the creation of one Lead at a time via manual input
router.post("/", async (req, res) => {
  const { email, phone, first_name, last_name } = req.body;

  if (!phone) {
    return res.status(400).send("New lead must have at least a phone number");
  }

  // Trim and strip all non-numeric characters
  const trimmedVal = phone.trim();
  const digits = trimmedVal.replace(/\D/g, "");

  if (digits.length !== 10) {
    return res.status(400).send("Invalid phone number");
  }

  try {
    const newLead = await db("lead").insert({
      email,
      phone: `+1${digits}`, // Note: Hardcoding country code for best UX
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
