import { Router } from "express";
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfDay,
} from "date-fns";
//
import { extractErrorMessage } from "../utils/error";
import db from "../utils/db";
import { Call } from "../types";

const router = Router();

export type TMetrics = {
  leadsCreatedCountPreviousPeriod: number | null;
  leadsCreatedCountCurrentPeriod: number | null;
  callsMadePreviousPeriod: Call[];
  callsMadeCurrentPeriod: Call[];
  callsAnsweredCountPreviousPeriod: number | null;
  callsAnsweredCountCurrentPeriod: number | null;
  averageCallDurationInSecondsPreviousPeriod: number | null;
  averageCallDurationInSecondsCurrentPeriod: number | null;
};
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
    const now = new Date();
    const today = startOfDay(now);

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
    // let from = format(subOperator(today, 1), "yyyy-MM-dd"); // exclusive of upper bound
    // let to = format(today, "yyyy-MM-dd"); // inclusive of lower bound
    let from = subOperator(today, 1); // today at 00:00:00
    let to = today; // tomorrow at 00:00:00

    // Leads
    const leadsCreatedPreviousPeriod = await db("lead")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count();

    // Calls made
    const callsMadePreviousPeriod = await db("call")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to]);

    // Calls answered
    const callsAnsweredPreviousPeriod = await db("call")
      .where({
        user_id: id,
        was_answered: true,
      })
      .whereBetween("created_at", [from, to])
      .count();

    // TODO: Finish this
    // Average call duration
    //   const averageCallDurationPreviousPeriodDbResult = await db.raw(`
    //   SELECT
    //     avg(disconnected_at - created_at) as average_call_duration
    //   FROM call
    //   WHERE user_id = ${id} AND created_at BETWEEN TO_TIMESTAMP(${from}) AND TO_TIMESTAMP(${to})
    // `);

    // const averageCallDurationPreviousPeriod =
    //   averageCallDurationPreviousPeriodDbResult &&
    //   averageCallDurationPreviousPeriodDbResult.rows &&
    //   averageCallDurationPreviousPeriodDbResult.rows.length
    //     ? averageCallDurationPreviousPeriodDbResult.rows[0]
    //         .average_call_duration
    //     : null;

    // Current period
    from = today; // inclusive of lower bound
    to = addOperator(today, 1); // exclusive of upper bound

    // Leads
    const leadsCreatedCurrentPeriod = await db("lead")
      .where({
        user_id: id,
      })
      .whereBetween("created_at", [from, to])
      .count();

    // Calls made
    console.log("from: ", from);
    console.log("to: ", to);
    const callsMadeCurrentPeriod = await db("call")
      .select("id", "user_id", "created_at")
      // .where({
      //   user_id: id,
      // })
      .whereBetween("created_at", [from, to]);

    console.log("callsMadeCurrentPeriod", callsMadeCurrentPeriod);

    // Calls answered
    const callsAnsweredCurrentPeriod = await db("call")
      .where({
        user_id: id,
        was_answered: true,
      })
      .whereBetween("created_at", [from, to])
      .count();

    // TODO: Finish this
    // Average call duration
    // const averageCallDurationCurrentPeriodDbResult = await db.raw(`
    //   SELECT
    //     avg(disconnected_at - created_at) as average_call_duration
    //   FROM call
    //   WHERE user_id = ${id} AND created_at BETWEEN TO_TIMESTAMP(${from}) AND TO_TIMESTAMP(${to})
    // `);

    // const averageCallDurationCurrentPeriod =
    //   averageCallDurationCurrentPeriodDbResult &&
    //   averageCallDurationCurrentPeriodDbResult.rows &&
    //   averageCallDurationCurrentPeriodDbResult.rows.length
    //     ? averageCallDurationCurrentPeriodDbResult.rows[0].average_call_duration
    //     : null;

    const resObject: TMetrics = {
      leadsCreatedCountPreviousPeriod:
        parseInt(leadsCreatedPreviousPeriod[0].count as string) || null,
      leadsCreatedCountCurrentPeriod:
        parseInt(leadsCreatedCurrentPeriod[0].count as string) || null,
      //
      callsMadePreviousPeriod: callsMadePreviousPeriod || null,
      callsMadeCurrentPeriod: callsMadeCurrentPeriod || null,
      //
      callsAnsweredCountPreviousPeriod:
        parseInt(callsAnsweredPreviousPeriod[0].count as string) || null,
      callsAnsweredCountCurrentPeriod:
        parseInt(callsAnsweredCurrentPeriod[0].count as string) || null,
      //
      averageCallDurationInSecondsPreviousPeriod: null,
      averageCallDurationInSecondsCurrentPeriod: null,
    };

    // Return all
    return res.status(200).send(resObject);
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
