require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
//
const db = require("./db");
const { extractErrorMessage } = require("./lib/error");

const app = express();
const port = 3005;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send(process.env.SECRET || "l34ds");
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
  console.log("got a lead", req.body);

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

    return res.status(200).json(newLead);
  } catch (error) {
    res.status(500).json({ message: extractErrorMessage(error) });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
