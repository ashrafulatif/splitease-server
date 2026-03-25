/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  PaymentStatus,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const isPaymentExist = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (isPaymentExist) {
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const subscriptionId = session.metadata?.subscriptionId;

      if (!paymentId || !subscriptionId) {
        return { message: "Missing payment/subscription metadata" };
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!payment) {
        return { message: `Payment ${paymentId} not found` };
      }

      const isPaid = session.payment_status === "paid";

      await prisma.$transaction(async (tx) => {
        if (isPaid) {
          await tx.subscription.updateMany({
            where: {
              userId: payment.userId,
              status: SubscriptionStatus.ACTIVE,
              id: { not: payment.subscriptionId },
            },
            data: {
              status: SubscriptionStatus.EXPIRED,
            },
          });

          const startDate = new Date();
          const endDate = addDays(
            startDate,
            payment.subscription.plan.durationDays,
          );

          await tx.subscription.update({
            where: {
              id: payment.subscriptionId,
            },
            data: {
              status: SubscriptionStatus.ACTIVE,
              startDate,
              endDate,
            },
          });

          await tx.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              stripeEventId: event.id,
              status: PaymentStatus.SUCCESS,
              paymentGatewayData: session as any,
            },
          });
        } else {
          await tx.subscription.update({
            where: {
              id: payment.subscriptionId,
            },
            data: {
              status: SubscriptionStatus.CANCELLED,
            },
          });

          await tx.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              stripeEventId: event.id,
              status: PaymentStatus.FAILED,
              paymentGatewayData: session as any,
            },
          });
        }
      });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const subscriptionId = session.metadata?.subscriptionId;

      if (paymentId && subscriptionId) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              stripeEventId: event.id,
              status: PaymentStatus.FAILED,
              paymentGatewayData: session as any,
            },
          });

          await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
              status: SubscriptionStatus.CANCELLED,
            },
          });
        });
      }
      break;
    }

    default:
      break;
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
  handlerStripeWebhookEvent,
};
