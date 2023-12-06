import { Router } from "express";
//
import db from "../utils/db";
import { LeadTag } from "../types";
const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {});
router.post("/", async (req, res) => {});
router.put("/:name", async (req, res) => {});

export default router;
