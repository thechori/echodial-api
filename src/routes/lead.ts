import { Router } from "express";
import multer from "multer";
import * as csv from "fast-csv";
import fs from "fs";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { Lead } from "../types";
import {
  isValidPhoneNumberForDb,
  transformPhoneNumberForDb,
} from "../utils/validators/phone";

// Handle the bulk upload of Leads via CSV files
const upload = multer({ dest: "tmp/csv/" });

const router = Router();

// Get all Leads
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  const leads = await db("lead").where({
    user_id: id,
  });

  res.status(200).send(leads);
});

// Update Lead
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  // Validate phone
  const phoneNumberForDb = transformPhoneNumberForDb(body.phone);

  if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
    return res.status(400).send("Phone number is not valid");
  }

  try {
    const rowsAffected = await db("lead")
      .where("id", id)
      .update({
        ...body,
        phone: phoneNumberForDb,
      });
    return res
      .status(200)
      .json({ message: `Successfully updated lead`, data: rowsAffected });
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Delete Lead
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === null) {
    return res.status(400).send("Missing `id` field");
  }

  try {
    const deletionResult = await db("lead").del().where("id", id);
    return res.status(200).send(deletionResult);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Delete multiple Leads
router.post("/bulk-delete", async (req, res) => {
  const { ids } = req.body;

  if (!ids) {
    return res.status(400).send("Missing `ids` field (or malformed)");
  }

  try {
    const rowsDeletedCount = await db("lead").whereIn("id", ids).del();
    return res.status(200).json({
      message: `Deleted ${rowsDeletedCount} rows`,
      data: rowsDeletedCount,
    });
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Create new Lead (single)
router.post("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { email, phone, first_name, last_name, source } = req.body;

  if (!phone) {
    return res.status(400).send("New lead must have at least a phone number");
  }

  // Trim and strip all non-numeric characters
  const phoneNumberForDb = transformPhoneNumberForDb(phone);

  if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
    return res.status(400).send("Invalid phone number");
  }

  try {
    const newLead = await db("lead").insert({
      user_id: id,
      email,
      phone: phoneNumberForDb, // Note: Hardcoding country code for best UX
      first_name,
      last_name,
      source,
    });

    return res.status(200).send(newLead);
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

router.post("/csv", upload.single("file"), function (req, res) {
  const { id } = res.locals.jwt_decoded;
  const { source } = req.body;

  // Validate file existence
  if (!req.file) {
    return res.status(400).send("Missing `file` field");
  }

  const fileRows: string[][] = []; // [ ["1", "ryan", "teodoro", "thechori@gmail.com", "+18326460869"], [...], [...] ]

  // Open uploaded file
  csv
    .parseFile(req.file.path)
    .on("data", function (data: any) {
      fileRows.push(data); // push each row
    })
    .on("end", async function () {
      // @ts-ignore
      fs.unlinkSync(req.file.path); // Remove temp file

      // Check for length
      if (fileRows.length < 2) {
        res.status(400).send("CSV file has no data");
      }

      // Validate structure
      const requiredColumnHeaders: {
        email: number | null;
        phone: number | null;
        first_name: number | null;
        last_name: number | null;
      } = {
        email: null,
        phone: null,
        first_name: null,
        last_name: null,
      };

      // Search first index of fileRows to create column mapping
      const h = fileRows.shift(); // better way
      // const h = fileRows[0]; // old way

      if (!h) {
        return res
          .status(400)
          .send(
            "CSV file corrupted. Please check the structure (e.g., column names) upload another one."
          );
      }

      // Ensure that all column maps were found, if not, show error
      requiredColumnHeaders.email = h.indexOf("email");
      requiredColumnHeaders.phone = h.indexOf("phone");
      requiredColumnHeaders.first_name = h.indexOf("first_name");
      requiredColumnHeaders.last_name = h.indexOf("last_name");

      const columnErrors: string[] = [];

      for (const [key, value] of Object.entries(requiredColumnHeaders)) {
        if (value === null || value === -1) {
          console.error(`Column ${key} is missing data.`);
          columnErrors.push(key);
        }
      }

      if (columnErrors.length) {
        return res
          .status(400)
          .send(
            `Errors found in (${
              columnErrors.length
            }) columns: ${columnErrors.join(", ")}`
          );
      }

      try {
        // Transform CSV output structure to match DB schema
        const leadsToInsert: Partial<Lead>[] = fileRows.map((row) => {
          // Transform phone number
          const rawPhoneValue = row[requiredColumnHeaders.phone as number];
          const phoneNumberForDb = transformPhoneNumberForDb(rawPhoneValue);

          // Validate phone number
          if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
            throw new Error(
              `Phone number "${rawPhoneValue}" did not pass validation requirements. Please check this value and try to upload the CSV file again.`
            );
          }

          return {
            user_id: id,
            email: row[requiredColumnHeaders.email as number],
            phone: phoneNumberForDb,
            first_name: row[requiredColumnHeaders.first_name as number],
            last_name: row[requiredColumnHeaders.last_name as number],
            source,
          };
        });

        // Insert into DB
        await db("lead").insert(leadsToInsert);
        res.status(200).json({
          message: `Successfully uploaded ${fileRows.length} leads`,
          data: fileRows,
        });
      } catch (e) {
        res.status(500).send(extractErrorMessage(e));
      }
    })
    .on("error", (e: any) => {
      res.status(500).send(extractErrorMessage(e));
    });
});

router.get("/pretty", async (req, res) => {
  const leads = await db("lead")
    .join("person", "person_id", "person.id")
    .join("campaign", "campaign_id", "campaign.id")
    .select(
      "lead.id",
      "lead.created_at",
      "lead.body as message",
      "person.phone as person_phone",
      "campaign.name as campaign_name"
    );
  res.status(200).send(leads);
});

export default router;
