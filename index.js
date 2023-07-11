require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
//
const db = require("./lib/db");
const { extractErrorMessage } = require("./lib/error");
const client = require("./lib/twilio");
const numbers = require("./config/numbers");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("l34ds");
});

app.get("/authorize", (req, res) => {
  const { authorization } = req.headers;
  if (authorization === process.env.ADMIN_PASSWORD) {
    return res.status(200).send("Success");
  }

  return res.status(401).send("Incorrect password");
});

app.get("/lead", async (req, res) => {
  const leads = await db("development.lead");
  res.status(200).send(leads);
});

app.get("/lead/pretty", async (req, res) => {
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

app.get("/person", async (req, res) => {
  try {
    const persons = await db("development.person");
    return res.status(200).send(persons);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

app.get("/campaign", async (req, res) => {
  try {
    const campaigns = await db("development.campaign");
    return res.status(200).send(campaigns);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

app.get("/campaign/pretty", async (req, res) => {
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

app.get("/listing", async (req, res) => {
  try {
    const listings = await db("development.listing");
    return res.status(200).send(listings);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

app.get("/listing/pretty", async (req, res) => {
  try {
    const listings = await db("development.listing as l")
      .join("development.campaign as c", "campaign_id", "c.id")
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

app.post("/campaign/:campaign_id/lead/voice", async (req, res) => {
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
});

// 1 = Mid-life crisis
// 2 = Soon-to-be parents
// 3 = Soon-to-be homeowners
app.post("/campaign/:campaign_id/lead", async (req, res) => {
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
});

// HOT LEADS
app.post("/insurednow.app", async (req, res) => {
  // ID 5 = All (insurednow.app website)
  const campaign_id = 5;

  const { firstName, lastName, phone, dob } = req.body;

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
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
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
    client.messages
      .create({
        body: "Hello! This is Ryan with Insured Now. Thank you so much for inquiring about our modern insurance options. One of our specialists will be in touch with you shortly. Have a great day! 😊",
        to: phone,
        from: numbers.barker,
      })
      .then((message) => console.log(message.sid));

    return res.status(200).send(newLead);
  } catch (e) {
    res.status(500).send(extractErrorMessage(e));
  }
});

app.listen(port, () => {
  console.log(`L34ds on port ${port}`);
});
