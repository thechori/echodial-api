import { Router } from "express";
//
import twilioClient from "../services/twilio";
import { extractErrorMessage } from "../utils/error";
import numbers from "../configs/numbers";

const router = Router();

// Read all Session data
router.get("/", (req, res) => {});

// Creates a new Session record
router.post("/", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email missing" });
  }

  // Write to DB
});

export default router;
