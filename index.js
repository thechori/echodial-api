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

app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();

  // message: req.body.Body
  // lead number: req.body.From
  // twilio number: req.body.To
  const { Body, From } = req.body;

  client.messages
    .create({
      body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
      to: From,
      from: numbers.barker,
    })
    .then((message) => console.log(message.sid));

  // This is how we respond to the text
  twiml.message("The Robots are coming! Head for the hills!");

  res.type("text/xml").send(twiml.toString());
});

app.get("/person", async (req, res) => {
  try {
    const persons = await db("development.person");
    return res.status(200).send(persons);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Each Twilio phone number can be configured to map to a different endpoint so we can cut down on SQL queries to
// extract this information at runtime

// Mid-life crisis
app.post("/campaign/1/lead", async (req, res) => {
  const campaignId = 1;
  const { Body, From } = req.body;

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

    console.log("creating new lead", personId, campaignId, Body);

    const newLead = await db("development.lead").insert({
      person_id: personId,
      campaign_id: campaignId,
      body: Body,
    });

    console.log("newLead", newLead);

    return res.status(200).send(newLead);
  } catch (e) {
    res.status(500).send(extractErrorMessage(e));
  }
});

//
app.post("/campaign/2/lead", async (req, res) => {
  const campaignId = 2;
});

app.post("/campaign/3/lead", async (req, res) => {
  const campaignId = 3;
});

// Keeping this endpoint alive to demo the SMS capabilities to people
app.post("/insure-demo", async (req, res) => {
  const { phone } = req.body;
  try {
    // Send text message
    sendText(phone);
    return res.status(200).json(newLead);
  } catch (error) {
    res.status(500).json({ message: extractErrorMessage(error) });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
