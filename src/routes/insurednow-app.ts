import { Request, Response, Router } from "express";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import twilioClient from "../utils/twilio";
import numbers from "../configs/numbers";

const router = Router();

// HOT LEADS
router.post("/insurednow.app", async (req: Request, res: Response) => {
  // ID 5 = All (insurednow.app website)
  const campaign_id = 5;

  const { phone, email, firstName, lastName, dob, favoriteColor } = req.body;

  try {
    const person = await db("development.person")
      .where({
        phone,
      })
      .first();

    let personId;

    if (!person) {
      // Create Person record
      const newPerson = await db("development.person")
        .insert({
          phone,
          email,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          favorite_color: favoriteColor,
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
      body: "(insurednow.app submission)",
    });

    // Send text message
    twilioClient.messages
      .create({
        body: "Hello! This is Ryan with Insured Now. Thank you so much for inquiring about our modern insurance options. One of our specialists will be in touch with you shortly. Have a great day! 😊",
        to: phone,
        from: numbers.barker,
      })
      .then((message: any) => console.log(message.sid));

    return res.status(200).send(newLead);
  } catch (e) {
    res.status(500).send(extractErrorMessage(e));
  }
});

export default router;
