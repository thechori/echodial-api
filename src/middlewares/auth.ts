import dotenv from "dotenv";
import jwt from "jsonwebtoken";
//
import { RequestHandler } from "express";
import { extractErrorMessage } from "../utils/error";

dotenv.config();

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  // Check for authorization field
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    // Extract and verify JWT
    const token = authorization.split(" ")[1];
    const jwtVerified = await jwt.verify(
      token,
      process.env.BCRYPT_SECRET as string
    );

    // Attach JWT to req for each access
    res.locals.jwt = jwtVerified;

    // Continue
    return next();
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    // Handle expired token error
    if (errorMessage === "jwt expired") {
      return res.status(401).send("JWT expired");
    }

    return res.status(500).send(errorMessage);
  }
};
