import { Router } from "express";
//
import { extractErrorMessage } from "../utils/error";
import db from "../utils/db";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";

const router = Router();

export type TMetricResolution = "day" | "week" | "month";
const validMetricResolutions = ["day", "week", "month"];

// Return high-level information for dashboard
router.get("/dashboard/:metric_resolution", async (req, res) => {
  const { id } = res.locals.jwt_decoded;
  const { metric_resolution } = req.params;

  // Ensure that endpoint is being hit properly (e.g., /metric/dashboard/day or /metric/dashboard/week)
  if (!validMetricResolutions.includes(metric_resolution)) {
    return res.status(400).send({
      message: `Metric resolution must be one of the following: ${validMetricResolutions.join(
        ", "
      )}`,
    });
  }

  try {
    // Store reference of today's date
    const today = new Date();

    // Determine which date operators to use based on resolution
    const subOperator =
      metric_resolution === "day"
        ? subDays
        : metric_resolution === "week"
        ? subWeeks
        : subMonths;
    const addOperator =
      metric_resolution === "day"
        ? addDays
        : metric_resolution === "week"
        ? addWeeks
        : addMonths;

    // Previous period
    // Generate date range: E.g., (from: today, to: tomorrow) = today
    let from = format(subOperator(today, 1), "yyyy-MM-dd"); // exclusive of upper bound
    let to = format(today, "yyyy-MM-dd"); // inclusive of lower bound

    // Leads
    const leadsCreatedPreviousPeriod = await db("lead")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Calls made
    const callsMadePreviousPeriod = await db("call")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Calls answered
    const callsAnsweredPreviousPeriod = await db("call")
      .where({
        user_id: id,
        was_answered: true,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Current period
    from = format(today, "yyyy-MM-dd"); // inclusive of lower bound
    to = format(addOperator(today, 1), "yyyy-MM-dd"); // exclusive of upper bound

    // Leads
    const leadsCreatedCurrentPeriod = await db("lead")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Calls made
    const callsMadeCurrentPeriod = await db("call")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Calls answered
    const callsAnsweredCurrentPeriod = await db("call")
      .where({
        user_id: id,
        was_answered: true,
      })
      .whereBetween("created_at", [from, to])
      .count()
      .first();

    // Return all
    return res.status(200).send({
      leadsCreatedPreviousPeriod: leadsCreatedPreviousPeriod?.count || null,
      leadsCreatedCurrentPeriod: leadsCreatedCurrentPeriod?.count || null,
      //
      callsMadePreviousPeriod: callsMadePreviousPeriod?.count || null,
      callsMadeCurrentPeriod: callsMadeCurrentPeriod?.count || null,
      //
      callsAnsweredPreviousPeriod: callsAnsweredPreviousPeriod?.count || null,
      callsAnsweredCurrentPeriod: callsAnsweredCurrentPeriod?.count || null,
      //
      averageCallDurationPreviousPeriod: null,
      averageCallDurationCurrentPeriod: null,
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
