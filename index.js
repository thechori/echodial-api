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

// 1 = Mid-life crisis
// 2 = Soon-to-be parents
// 3 = Soon-to-be homeowners
app.post("/campaign/:campaign_id/lead", async (req, res) => {
  const { campaign_id } = req.params;
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
