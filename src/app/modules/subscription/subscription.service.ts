import status from "http-status";
import { randomUUID } from "crypto";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  PaymentStatus,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

const FREE_PLAN_FEATURES = [
  "Basic house and member management",
  "Basic meal, deposit and expense tracking",
  "Monthly summary report",
];

const getMySubscription = async (user: IRequestUser) => {
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.userId,
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gt: new Date(),
      },
    },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!activeSubscription) {
    return {
      tier: "FREE",
      status: "ACTIVE",
      features: FREE_PLAN_FEATURES,
      subscription: null,
    };
  }

  return {
    tier: activeSubscription.plan.name,
    status: activeSubscription.status,
    features: activeSubscription.plan.features,
    subscription: activeSubscription,
  };
};

const initiateSubscription = async (planId: string, user: IRequestUser) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  if (!plan) {
    throw new AppError(status.NOT_FOUND, "Plan not found");
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (!userData || userData.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const [subscription, payment] = await prisma.$transaction(async (tx) => {
    const createdSubscription = await tx.subscription.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        startDate: new Date(),
        endDate: new Date(),
        status: SubscriptionStatus.CANCELLED,
      },
    });

    const createdPayment = await tx.payment.create({
      data: {
        userId: user.userId,
        subscriptionId: createdSubscription.id,
        amount: plan.price,
        transactionId: randomUUID(),
        status: PaymentStatus.PENDING,
      },
    });

    return [createdSubscription, createdPayment];
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userData.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan.name} Subscription`,
            description: `${plan.durationDays} days access`,
          },
          unit_amount: Math.round(plan.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      planId: plan.id,
      userId: user.userId,
      subscriptionId: subscription.id,
      paymentId: payment.id,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/subscription/success?subscription_id=${subscription.id}&payment_id=${payment.id}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/subscription?cancelled=true`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentGatewayData: session as unknown as object,
    },
  });

  return {
    subscriptionId: subscription.id,
    paymentId: payment.id,
    paymentUrl: session.url,
  };
};

const getSubscriptionList = async () => {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  return subscriptions;
};

export const SubscriptionService = {
  getMySubscription,
  initiateSubscription,
  getSubscriptionList,
};
