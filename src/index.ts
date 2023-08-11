require("dotenv").config();

import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
//
import { authMiddleware } from "./middlewares/auth";
import authRouter from "./routes/auth";
import leadRouter from "./routes/lead";
import userRouter from "./routes/user";
import sessionRouter from "./routes/session";
import dialerRouter from "./routes/dialer";
import callerIdRouter from "./routes/caller-id";
import smsRouter from "./routes/sms";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("common"));

app.get("/", (req: Request, res: Response) => {
  res.send("l34ds");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/session", authMiddleware, sessionRouter);
app.use("/lead", authMiddleware, leadRouter);
app.use("/caller-id", authMiddleware, callerIdRouter);
app.use("/sms", authMiddleware, smsRouter);
app.use("/dialer", dialerRouter);

app.listen(process.env.PORT, () => {
  console.log("Environment: ", process.env.NODE_ENV);
  console.log(`L34ds on port ${process.env.PORT}`);
});
