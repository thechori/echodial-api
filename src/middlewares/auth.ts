import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
//
import { extractErrorMessage } from "../utils/error";
import {
  EXPIRED_SESSION_MESSAGE,
  UNAUTHORIZED_REQUEST_MESSAGE,
} from "../configs/error-messages";
import envConfig from "../configs/env";

dotenv.config();

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  // Check for authorization field
  if (!authorization) {
    return res.status(401).json(UNAUTHORIZED_REQUEST_MESSAGE);
  }

  try {
    // Extract and verify JWT
    const accessToken = authorization.split(" ")[1];
    const jwt_decoded = await jwt.verify(accessToken, envConfig.bcryptSecret);

    // Attach JWT to req for each access
    res.locals.jwt_decoded = jwt_decoded;

    // Continue
    return next();
  } catch (e) {
    const errorMessage = extractErrorMessage(e);

    // Handle expired access token error
    if (errorMessage === "jwt expired") {
      return res.status(401).json(EXPIRED_SESSION_MESSAGE);
    }

    return res.status(401).json(errorMessage);
  }
};
