import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getMySubscription(req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const initiateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.initiateSubscription(
    req.params.planId as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription payment initiated successfully",
    data: result,
  });
});

const getSubscriptionList = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSubscriptionList();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscription list retrieved successfully",
    data: result,
  });
});
export const SubscriptionController = {
  getMySubscription,
  initiateSubscription,
  getSubscriptionList,
};
