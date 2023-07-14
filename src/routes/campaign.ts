import { Request, Response, Router } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
//
import { extractErrorMessage } from "../utils/error";
import db from "../utils/db";

const router = Router();

router.get("/campaign", async (req: Request, res: Response) => {
  try {
    const campaigns = await db("development.campaign");
    return res.status(200).send(campaigns);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

router.get("/campaign/pretty", async (req: Request, res: Response) => {
  try {
    const campaigns = await db("development.campaign as c")
      .join(
        "development.twilio_phone_number as tpn",
        "twilio_phone_number_id",
        "tpn.id"
      )
      .select(
        "c.id as id",
        "c.name",
        "c.description",
        "c.notes",
        "tpn.number",
        "tpn.friendly_name"
      );

    return res.status(200).send(campaigns);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

router.post(
  "/campaign/:campaign_id/lead/voice",
  async (req: Request, res: Response) => {
    const { campaign_id } = req.params;
    const { From, FromCity, FromState, FromZip } = req.body;

    console.log("req.body", req.body);
    console.log("req.params", req.params);

    try {
      const person = await db("development.person")
        .where({
          phone: From,
        })
        .first();

      let personId;

      if (!person) {
        // Create Person record
        const newPerson = await db("development.person")
          .insert({
            phone: From,
            city: FromCity,
            state: FromState,
            zip: FromZip,
          })
          .returning("id")
          .into("development.person");
        personId = newPerson[0].id;
      } else {
        personId = person.id;
      }

      await db("development.lead").insert({
        person_id: personId,
        campaign_id,
        body: null,
      });

      const response = new VoiceResponse();
      response.hangup();

      return res.status(200).send(response.toString());
    } catch (e) {
      const response = new VoiceResponse();
      response.hangup();

      res.status(500).send(extractErrorMessage(e));
    }
  }
);

// 1 = Mid-life crisis
// 2 = Soon-to-be parents
// 3 = Soon-to-be homeowners
router.post(
  "/campaign/:campaign_id/lead",
  async (req: Request, res: Response) => {
    const { campaign_id } = req.params;
    const { Body, From, FromCity, FromState, FromZip } = req.body;

    console.log("req.body", req.body);
    console.log("req.params", req.params);

    try {
      const person = await db("development.person")
        .where({
          phone: From,
        })
        .first();

      let personId;

      if (!person) {
        // Create Person record
        const newPerson = await db("development.person")
          .insert({
            phone: From,
            city: FromCity,
            state: FromState,
            zip: FromZip,
          })
          .returning("id")
          .into("development.person");
        personId = newPerson[0].id;
      } else {
        personId = person.id;
      }

      const newLead = await db("development.lead").insert({
        person_id: personId,
        campaign_id,
        body: Body,
      });

      return res.status(200).send(newLead);
    } catch (e) {
      res.status(500).send(extractErrorMessage(e));
    }
  }
);

export default router;
