import { ErrorRequestHandler } from "express";
//
import { extractErrorMessage } from "../utils/error";

/**
 * This error handler allows us to optimistically type the responses
 * for our route controllers such that we don't have to include a `|`
 * and define what the erroneous response looks like.
 *
 *  // Example
 *  res: Response<TrialCredit | { message: string }>,
 *    to
 *  res: Response<TrialCredit>,
 *
 *
 * For the best application possible, before throwing the error, we should
 * also set the proper HTTP response status code to indicate what happened
 *
 * // Example
 * if (error) {
 *    res.status(404);
 *    throw Error("That thing was not found")
 * }
 *
 */

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Convert successful implying `200` code to `500`
  // Support custom statusCode
  // Default to 500 if all else fails
  const statusCode =
    res.statusCode === 200 ? 500 : res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  res.json(extractErrorMessage(err));

  next(err);
};
