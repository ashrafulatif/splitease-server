import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payments.service";

const handlerStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res
        .status(status.BAD_REQUEST)
        .json({ message: "Missing Stripe signature or webhook secret" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch {
      return res
        .status(status.BAD_REQUEST)
        .json({ message: "Error processing Stripe webhook" });
    }

    const result = await PaymentService.handlerStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  handlerStripeWebhookEvent,
};
