import dotenv from "dotenv";
import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
//
import { extractErrorMessage } from "../utils/error";
import envConfig from "../configs/env";

dotenv.config();

export const superUserAuthMiddleware: RequestHandler = async (
  req,
  res,
  next,
) => {
  const { authorization } = req.headers;

  // Check for authorization field
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    // Extract and verify JWT
    const token = authorization.split(" ")[1];
    const jwt_decoded = (await jwt.verify(
      token,
      envConfig.bcryptSecret,
    )) as JwtPayload;

    // TODO: create DB table of super users and check to see if this user is in that group
    // Validate person is a Super User
    const { email } = jwt_decoded;
    if (email !== "thechori@gmail.com") {
      return res.status(500).send({ message: "Super user access required" });
    }

    // Attach JWT to req for each access
    res.locals.jwt_decoded = jwt_decoded;

    // Continue
    return next();
  } catch (e) {
    const errorMessage = extractErrorMessage(e);

    // Handle expired token error
    if (errorMessage === "jwt expired") {
      return res.status(401).send({ message: "JWT expired" });
    }

    return res.status(500).send({ message: errorMessage });
  }
};
