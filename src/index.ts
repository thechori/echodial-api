require("dotenv").config();

import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
//
import authRouter from "./routes/auth";
import leadRouter from "./routes/lead";
import userRouter from "./routes/user";
import dialerRouter from "./routes/dialer";
import { authMiddleware } from "./middlewares/auth";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("l34ds");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/lead", leadRouter);
app.use("/dialer", authMiddleware, dialerRouter);

app.listen(process.env.PORT, () => {
  console.log("Environment: ", process.env.NODE_ENV);
  console.log(`L34ds on port ${process.env.PORT}`);
});
