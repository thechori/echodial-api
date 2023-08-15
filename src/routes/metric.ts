import { Router } from "express";
//
import { extractErrorMessage } from "../utils/error";
import db from "../utils/db";
import { addDays, format } from "date-fns";

const router = Router();

// Return high-level information for dashboard
router.get("/dashboard/day", async (req, res) => {
  const { id } = res.locals.jwt_decoded;

  try {
    // Generate date range: (from: today, today: tomorrow) = today
    const today = new Date();
    const from = format(today, "yyyy-MM-dd"); // inclusive of lower bound
    const to = format(addDays(today, 1), "yyyy-MM-dd"); // exclusive of upper bound

    // Leads created today
    const leadsCreatedToday = await db("lead")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Calls made today
    // const callsMadeToday = await db("")

    // Calls answered today
    // const callsAnsweredToday = await db("")

    // Average call duration
    // const averageCallDurationToday = await db("")

    // Return all
    return res.status(200).send({
      leadsCreatedToday: leadsCreatedToday?.count || null,
      callsMadeToday: null,
      callsAnsweredToday: null,
      averageCallDurationToday: null,
    });
  } catch (e) {
    return res.status(500).send(extractErrorMessage(e));
  }
});

// Return high-level information for dashboard
router.get("/dashboard/week", async (req, res) => {
  // weekly resolution
});

// Return high-level information for dashboard
router.get("/dashboard/month", async (req, res) => {
  // monthly resolution
});

export default router;
