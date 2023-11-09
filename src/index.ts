require("dotenv").config();

// Error handling middleware - must be required before using it
require("express-async-errors");

import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
//
import { authMiddleware } from "./middlewares/auth";
import authRouter from "./routes/auth";
import leadRouter from "./routes/lead";
import userRouter from "./routes/user";
import dialerRouter from "./routes/dialer";
import callRouter from "./routes/call";
import callerIdRouter from "./routes/caller-id";
import metricRouter from "./routes/metric";
import bucketRouter from "./routes/bucket";
import stripeRouter from "./routes/stripe";
import trialCreditRouter from "./routes/trial-credit";
import { extractErrorMessage } from "./utils/error";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("common"));

app.get("/", (req: Request, res: Response) => {
  res.send("EchoDial");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/lead", authMiddleware, leadRouter);
app.use("/caller-id", authMiddleware, callerIdRouter);
app.use("/call", authMiddleware, callRouter);
app.use("/dialer", dialerRouter);
app.use("/metric", authMiddleware, metricRouter);
app.use("/bucket", authMiddleware, bucketRouter);
app.use("/stripe", authMiddleware, stripeRouter);
app.use("/trial-credit", authMiddleware, trialCreditRouter);

// Error handling middleware (via express-async-errors)
app.use((err: any, req: Request, res: Response, next: any) => {
  res.status(400).send({ message: extractErrorMessage(err) });
  next(err);
});

app.listen(process.env.PORT, () => {
  console.log("Environment: ", process.env.NODE_ENV);
  console.log(`EchoDial on port ${process.env.PORT}`);
});
