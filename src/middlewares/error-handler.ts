import { ErrorRequestHandler } from "express";
//
import { extractErrorMessage } from "../utils/error";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  res.json(extractErrorMessage(err));

  next(err);
};
