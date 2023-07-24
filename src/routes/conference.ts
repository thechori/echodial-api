import { Request, Response, Router } from "express";
//
import twilioClient from "../services/twilio";

const router = Router();

let activeConferenceSids: string[] = [];

router.get("/", async (req: Request, res: Response) => {
  twilioClient.conferences
    .list({
      status: "in-progress",
    })
    .then((c: any) => res.status(200).send(c))
    .catch((e: any) => res.status(500).send(e));
});

// Create new Conference to dial Lead
router.post("/", (req, res) => {
  const { from, to, session_id } = req.body;
});

router.get("/active-conference-sids", (req, res) => {
  return res.status(200).send(activeConferenceSids);
});
router.post("/active-conference-sids", (req, res) => {
  const { conference_sid } = req.body;
  if (!conference_sid) {
    return res.status(400).send("missing conference_sid");
  }
  activeConferenceSids.push(conference_sid);
  return res.status(200).send(activeConferenceSids);
});
router.delete("/active-conference-sids/:conference_sid", (req, res) => {
  const { conference_sid } = req.params;
  if (!conference_sid) {
    return res.status(400).send("missing conference_sid");
  }
  let indexFound = activeConferenceSids.indexOf(conference_sid);
  if (indexFound === -1) {
    return res.status(400).send("conference_sid not found");
  }
  activeConferenceSids.splice(indexFound, 1);
  return res.status(200).send(activeConferenceSids);
});

// Update Conference (e.g., move Participant into Conference)
router.put("/", (req, res) => {
  const {} = req.body;
});

export default router;
