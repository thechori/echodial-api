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
const { addMinutes } = require("date-fns");
const sleep = require("./lib/helpers/sleep");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("l34ds");
});

/**
 *
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
  // lead number: req.body.From
  // twilio number: req.body.To
  const { Body, From, To } = req.body;

  // Check for an existing conversation
  // FIND * IN Message WHERE phone = FROM ORDER BY created_at GET FIRST
  // IF messageCount = 0 , greet them
  // IF messageCount =

  // Note: 15 minute MINIMUM for scheduled messages
  const scheduledTime = addMinutes(Date.now(), 16);

  client.messages
    .create({
      body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
      to: From,
      from: numbers.barker,
      sendAt: scheduledTime,
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
  // Begin looping every minute to check for any items in `scheduled_message` table
  dispatchScheduledMessages();

  console.log(`Example app listening on port ${port}`);
});

async function dispatchScheduledMessages() {
  console.log("checking for messages to send...");

  // Check `scheduled_message` table for rows
  const messagesToSend = await db("development.scheduled_message");

  if (messagesToSend.length) {
    console.log("found some messages to send", messagesToSend);
  }

  // If found, loop through each, send text (if: Date.now() > sendAt), and then delete from the table

  // 1 min delay until checking for new messages
  await sleep(60000);
  dispatchScheduledMessages();
}
