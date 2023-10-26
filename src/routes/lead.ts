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

// Get Lead by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === null || id === undefined) {
    return res.status(400).send("Missing `id` parameter");
  }

  const leads = await db("lead").where({
    id,
  });

  if (leads.length !== 1) {
    return res.status(400).send({
      message:
        "There was an issue fetching the single Lead. Check the ID and try again",
    });
  }

  res.status(200).send(leads[0]);
});

// Update Lead (entirely via PUT)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { phone } = body;

  if (!phone) {
    return res.status(400).send({ message: "Missing `phone` field" });
  }

  // Validate phone
  const phoneNumberForDb = transformPhoneNumberForDb(body.phone);

  if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
    return res.status(400).send("Phone number is not valid");
  }

  try {
    const updatedLeads = await db("lead")
      .where("id", id)
      .update({
        ...body,
        phone: phoneNumberForDb,
        updated_at: new Date().toISOString(), // Note: manually doing this because knex does not support it
      })
      .returning("*");

    if (updatedLeads.length !== 1) {
      return res.status(400).send({
        message:
          "An issue occurred when attempting to update the single Lead entry. Check the ID and try again",
      });
    }

    return res.status(200).send(updatedLeads[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

// Update Lead (partial update via PATCH)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { phone } = body;

  // IF phone is changed, validate it
  if (phone) {
    // Validate phone
    const phoneNumberForDb = transformPhoneNumberForDb(body.phone);

    if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
      return res.status(400).send("Phone number is not valid");
    }
  }

  try {
    const updatedLeads = await db("lead")
      .where("id", id)
      .update({
        ...body,
        updated_at: new Date().toISOString(), // Note: manually doing this because knex does not support it
      })
      .returning("*");

    if (updatedLeads.length !== 1) {
      return res.status(400).send({
        message:
          "The single lead was not updated properly. Check the ID parameter and try again",
      });
    }

    return res.status(200).json(updatedLeads[0]);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
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
    return res.status(500).send({ message: extractErrorMessage(e) });
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
    return res.status(500).send({ message: extractErrorMessage(e) });
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
    return res.status(500).send({ message: extractErrorMessage(e) });
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
      const columnHeaders: {
        email: number;
        phone: number;
        first_name: number;
        last_name: number;
      } = {
        email: -1,
        phone: -1,
        first_name: -1,
        last_name: -1,
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
      columnHeaders.email = h.indexOf("email");
      columnHeaders.phone = h.indexOf("phone");
      columnHeaders.first_name = h.indexOf("first_name");
      columnHeaders.last_name = h.indexOf("last_name");

      const columnErrors: string[] = [];

      for (const [key, value] of Object.entries(columnHeaders)) {
        // Column not found
        if (value === -1) {
          const error = `Column "${key}" is missing or misspelled`;
          columnErrors.push(error);
        }
      }

      if (columnErrors.length) {
        return res.status(400).send(columnErrors.join(", "));
      }

      try {
        // Transform CSV output structure to match DB schema
        const leadsToInsert: Partial<Lead>[] = fileRows.map((row) => {
          // Transform phone number
          const rawPhoneValue = row[columnHeaders.phone as number];
          const phoneNumberForDb = transformPhoneNumberForDb(rawPhoneValue);

          // Validate phone number
          if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
            throw new Error(
              `Phone number "${rawPhoneValue}" did not pass validation requirements. Please check this value and try to upload the CSV file again.`
            );
          }

          return {
            user_id: id,
            email: row[columnHeaders.email as number],
            phone: phoneNumberForDb,
            first_name: row[columnHeaders.first_name as number],
            last_name: row[columnHeaders.last_name as number],
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
