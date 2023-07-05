require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;
//
const db = require("./lib/db");
const { extractErrorMessage } = require("./lib/error");
const { sendText } = require("./scripts/contact-leads");
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

// https://api.insure.teodorosystems.com/campaign/1/leads/voice
app.post("/campaign/:campaign_id/lead/voice", async (req, res) => {
  // const { campaign_id } = req.params;
  // const { Body, From } = req.body;

  console.log("req.body", req.body);
  console.log("req.params", req.params);

  return res.status(200).send("ok");
});

// 1 = Mid-life crisis
// 2 = Soon-to-be parents
// 3 = Soon-to-be homeowners
app.post("/campaign/:campaign_id/lead", async (req, res) => {
  const { campaign_id } = req.params;
  const { Body, From } = req.body;

  console.log("req.body", req.body);
  console.log("req.params", req.params);

  try {
    const person = await db("development.person")
      .where({
        phone: From,
      })
      .first();
    console.log("person", person);

    let personId;

    if (!person) {
      // Create Person record
      const newPerson = await db("development.person")
        .insert({
          phone: From,
        })
        .select("id");
      console.log("newPerson", newPerson);
      personId = newPerson.id;
    } else {
      console.log("found person!", person);
      personId = person.id;
    }

    console.log("creating new lead", personId, Body);

    const newLead = await db("development.lead").insert({
      person_id: personId,
      campaign_id,
      body: Body,
    });

    console.log("newLead", newLead);

    return res.status(200).send(newLead);
  } catch (e) {
    res.status(500).send(extractErrorMessage(e));
  }
});

// Keeping this endpoint alive to demo the SMS capabilities to people
app.post("/insure-demo", async (req, res) => {
  const { phone } = req.body;
  try {
    // Send text message
    sendText(phone);
    return res.status(200).send("success");
  } catch (error) {
    res.status(500).json({ message: extractErrorMessage(error) });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
