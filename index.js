require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;
//
const db = require("./lib/db");
const { extractErrorMessage } = require("./lib/error");
const { sendText } = require("./scripts/contact-leads");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("l34ds");
});

/**
  req.body: {
   ToCountry: 'US',
   ToState: 'TX',
   SmsMessageSid: 'SM76a85162db85d1ab9e46dc77d4c45095',
   NumMedia: '0',
   ToCity: 'HOUSTON',
   FromZip: '77097',
   SmsSid: 'SM76a85162db85d1ab9e46dc77d4c45095',
   FromState: 'TX',
   SmsStatus: 'received',
   FromCity: 'HOUSTON',
   Body: 'Hi',
   FromCountry: 'US',
   To: '+12812068992',
   ToZip: '77079',
   NumSegments: '1',
   MessageSid: 'SM76a85162db85d1ab9e46dc77d4c45095',
   AccountSid: 'AC2c2ecb0f9459a967800a799e0abe3129',
   From: '+18326460869',
   ApiVersion: '2010-04-01'
 }
 */

app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();

  // message: req.body.Body
  // number: req.body.From
  const { Body, From } = req.body;

  // Check for an existing conversation

  client.messages
    .create({
      body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
      to: toNumber,
      from: myNewFriendswoodNumber,
    })
    .then((message) => console.log(message.sid));

  // This is how we respond to the text
  twiml.message("The Robots are coming! Head for the hills!");

  res.type("text/xml").send(twiml.toString());
});

app.get("/lead", async (req, res) => {
  try {
    const leads = await db("development.lead");
    return res.status(200).send(leads);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

app.post("/lead", async (req, res) => {
  // submit to DB
  const {
    first_name,
    last_name,
    phone,
    email,
    birthdate,
    address,
    address_2,
    city,
    state,
    zip,
  } = req.body;

  try {
    const newLead = await db("development.lead").insert({
      first_name,
      last_name,
      phone,
      email,
      birthdate,
      address,
      address_2,
      city,
      state,
      zip,
    });

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
