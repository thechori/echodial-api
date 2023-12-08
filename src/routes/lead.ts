import { Router } from "express";
import multer from "multer";
import * as csv from "fast-csv";
import fs from "fs";
//
import db from "../utils/db";
import { extractErrorMessage } from "../utils/error";
import { Lead, LeadStandardProperty } from "../types";
import {
  isValidPhoneNumberForDb,
  transformPhoneNumberForDb,
} from "../utils/validators/phone";
import { authMiddleware } from "../middlewares/auth";
import leadStatusRouter from "./lead.status";
import leadStandardPropertyRouter from "./lead.property.standard";
import leadCustomPropertyRouter from "./lead.property.custom";
import leadPropertyGroupRouter from "./lead.property.group";
import leadPropertyTypeRouter from "./lead.property.type";
import leadTagRouter from "./lead.tag";

// Handle the bulk upload of Leads via CSV files
const upload = multer({ dest: "tmp/csv/" });

const router = Router({ mergeParams: true });

// Nested routers
// Note: Placement of this mattered -- the endpoint would crash when this was beneath the current router definitions
router.use("/status", authMiddleware, leadStatusRouter);
//
router.use("/property/standard", authMiddleware, leadStandardPropertyRouter);
router.use("/property/custom", authMiddleware, leadCustomPropertyRouter);
router.use("/property/type", authMiddleware, leadPropertyTypeRouter);
router.use("/property/group", authMiddleware, leadPropertyGroupRouter);
router.use("/tag", authMiddleware, leadTagRouter);

// Get all Leads
router.get("/", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  const leads = await db<Lead>("lead").where({
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

  const leads = await db<Lead>("lead").where("id", id);

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

  // Validate phone
  let phoneNumberForDb = null;
  if (phone) {
    phoneNumberForDb = transformPhoneNumberForDb(body.phone);

    if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
      return res.status(400).send("Phone number is not valid");
    }
  }

  try {
    const updatedLeads = await db<Lead>("lead")
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
  let phoneNumberForDb = null;
  if (phone) {
    // Validate phone
    phoneNumberForDb = transformPhoneNumberForDb(body.phone);

    if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
      return res.status(400).send("Phone number is not valid");
    }
  }

  try {
    const updatedLeads = await db<Lead>("lead")
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
    const deletionResult = await db<Lead>("lead").del().where("id", id);
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
    const rowsDeletedCount = await db<Lead>("lead").whereIn("id", ids).del();
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
  // const { email, phone, first_name, last_name, source } = req.body;
  const phone = req.body.phone;
  let phoneNumberForDb;
  if (phone) {
    // Trim and strip all non-numeric characters
    phoneNumberForDb = transformPhoneNumberForDb(phone);

    if (!isValidPhoneNumberForDb(phoneNumberForDb)) {
      return res.status(400).send("Invalid phone number");
    }
  }
  try {
    const newLead = await db<Lead>("lead").insert({
      user_id: id,
      ...req.body,
      phone: phoneNumberForDb,
    });

    return res.status(200).send(newLead);
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

router.post("/csv/validate", async (req, res) => {
  const dataArray = JSON.parse(req.body.columnData);
  const propertyToCheck = req.body.propertyToCheck;
  const returnObject = { message: "", error: true };
  if (dataArray.length < 1) {
    returnObject.message = "No data to validate";
    return res.json(returnObject);
  }
  if (propertyToCheck === "phone") {
    const validPhoneNumbers = dataArray.every((value: any) => {
      // Remove non-digit characters
      if (!value) {
        return true;
      }
      const cleanedValue = value.toString().replace(/\D/g, "");

      // Check if the cleaned value matches the desired phone number patterns
      return (
        isValidPhoneNumberForDb(value.toString()) ||
        /^\d{10}$/.test(cleanedValue) ||
        /^1\d{10}$/.test(cleanedValue)
      );
    });
    if (!validPhoneNumbers) {
      returnObject.message = "Invalid phone number format";
      return res.json(returnObject);
    } else {
      returnObject.error = false;
      return res.json(returnObject);
    }
  }
  const leadStandardProperties: LeadStandardProperty[] = await db(
    "lead_standard_property"
  ).select("name");

  const leadStandardPropertiesValues = leadStandardProperties.map(
    (obj) => obj.name
  );
  if (!leadStandardPropertiesValues.includes(propertyToCheck)) {
    returnObject.message = "No need to validate!";
    returnObject.error = false;
    return res.json(returnObject);
  }
  const leadsColumnInfo: any = await db("lead").columnInfo(propertyToCheck);

  //check for null values
  if (!leadsColumnInfo.nullable && dataArray.includes(null)) {
    returnObject.message = "Values in this column can't be empty";
    return res.json(returnObject);
  }

  //check if all values are under max length
  if (leadsColumnInfo.maxLength) {
    const dataArrayToStrings = dataArray.map((data: any) =>
      data !== null ? data.toString() : ""
    );

    const allValuesUnderMaxLength = dataArrayToStrings.every(
      (value: any) => value.length <= leadsColumnInfo.maxLength
    );

    if (!allValuesUnderMaxLength) {
      returnObject.message = "Values are too long";
      return res.json(returnObject);
    }
  }

  returnObject.error = false;
  return res.json(returnObject);
});

router.post("/csv", upload.single("file"), function (req, res) {
  const { id } = res.locals.jwt_decoded;
  const source = req.body.source;

  // Validate file existence
  if (!req.file) {
    return res.status(400).send("Missing `file` field");
  }
  const mappingArray = JSON.parse(req.body.headerToProperties);

  const fileRows: string[][] = []; // [ ["1", "ryan", "teodoro", "thechori@gmail.com", "+18326460869"], [...], [...] ]
  try {
    csv
      .parseFile(req.file.path)
      .on("data", function (data: any) {
        fileRows.push(data); // push each row
      })
      .on("end", async function () {
        try {
          // @ts-ignore
          fs.unlinkSync(req.file.path); // Remove temp file

          // Check for length
          if (fileRows.length < 2) {
            res.status(400).send("CSV file has no data");
          }
          const leadStandardProperties: LeadStandardProperty[] = await db(
            "lead_standard_property"
          ).select("name");
          const standardProperties = leadStandardProperties.map(
            (item) => item.name
          );
          const fileBody = fileRows.slice(1);
          for (let row = 0; row < fileBody.length; row++) {
            const newEntry: any = {};
            for (let col = 0; col < fileBody[row].length; col++) {
              if (mappingArray[col].mapped) {
                const property: string = mappingArray[col].property;
                //check if property is in Standard Properties
                //else insert into Custom Properties
                if (standardProperties.includes(property)) {
                  if (property === "phone") {
                    const phoneNumberString = fileBody[row][col].toString();
                    if (phoneNumberString.trim() === "") {
                      newEntry[property] = null;
                    } else {
                      newEntry[property] =
                        transformPhoneNumberForDb(phoneNumberString);
                    }
                  } else {
                    newEntry[property] = fileBody[row][col];
                  }
                } else {
                  const valueToAdd = { [property]: fileBody[row][col] };
                  if ("custom_properties" in newEntry) {
                    const existingCustomProperties =
                      newEntry["custom_properties"];
                    newEntry["custom_properties"] = {
                      ...existingCustomProperties,
                      ...valueToAdd,
                    };
                  } else {
                    newEntry["custom_properties"] = valueToAdd;
                  }
                }
              }
            }
            newEntry["user_id"] = id;
            newEntry["source"] = source;
            await db<Lead>("lead").insert(newEntry);
          }
          res.status(200).json({
            message: `Successfully uploaded leads`,
          });
        } catch (e) {
          return res.status(500).send({ message: extractErrorMessage(e) });
        }
      })
      .on("error", (e: any) => {
        return res.status(500).send({ message: extractErrorMessage(e) });
      });
  } catch (e) {
    return res.status(500).send({ message: extractErrorMessage(e) });
  }
});

router.get("/pretty", async (req, res) => {
  const leads = await db<Lead>("lead")
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
