import express, { Application, Request, Response } from "express";
import { IndexRouter } from "./app/routes";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import path from "path";

import cors from "cors";
import { envVars } from "./app/config/env";
import qs from "qs";
import { auth } from "./app/lib/auth";
import { toNodeHandler } from "better-auth/node";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { PaymentController } from "./app/modules/payments/payments.controller";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handlerStripeWebhookEvent,
);

//cors
app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:4000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use("/api/auth", toNodeHandler(auth));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1", IndexRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("SplitEase - Smart Expense management!");
});
app.use(notFound);

app.use(globalErrorHandler);

export default app;
