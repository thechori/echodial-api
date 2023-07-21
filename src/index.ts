require("dotenv").config();

import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
//
import authRouter from "./routes/auth";
import campaignRouter from "./routes/campaign";
import insuredNowAppRouter from "./routes/insurednow-app";
import leadRouter from "./routes/lead";
import listingRouter from "./routes/listing";
import personRouter from "./routes/person";
import userRouter from "./routes/user";
import dialerRouter from "./routes/dialer";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("l34ds");
});

app.use("/auth", authRouter);
app.use("/campaign", campaignRouter);
app.use("/insurednow.app", insuredNowAppRouter);
app.use("/lead", leadRouter);
app.use("/listing", listingRouter);
app.use("/person", personRouter);
app.use("/user", userRouter);
app.use("/dialer", dialerRouter);

app.listen(process.env.PORT, () => {
  console.log("Environment: ", process.env.NODE_ENV);
  console.log(`L34ds on port ${process.env.PORT}`);
});
