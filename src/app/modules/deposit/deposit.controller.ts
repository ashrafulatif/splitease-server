import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DepositService } from "./deposit.service";

const createDeposit = catchAsync(async (req: Request, res: Response) => {
  const result = await DepositService.createDeposit(req.body, req.user);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Deposit created successfully",
    data: result,
  });
});

const getDepositsByMonth = catchAsync(async (req: Request, res: Response) => {
  const monthId = req.query.monthId as string;

  if (!monthId) {
    return sendResponse(res, {
      statusCode: status.BAD_REQUEST,
      success: false,
      message: "monthId query parameter is required",
      data: null,
    });
  }

  const result = await DepositService.getDepositsByMonth(monthId, req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deposits retrieved successfully",
    data: result,
  });
});

const getDepositById = catchAsync(async (req: Request, res: Response) => {
  const result = await DepositService.getDepositById(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deposit retrieved successfully",
    data: result,
  });
});

const updateDeposit = catchAsync(async (req: Request, res: Response) => {
  const result = await DepositService.updateDeposit(
    req.params.id as string,
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deposit updated successfully",
    data: result,
  });
});

const deleteDeposit = catchAsync(async (req: Request, res: Response) => {
  const result = await DepositService.deleteDeposit(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deposit deleted successfully",
    data: result,
  });
});

export const DepositController = {
  createDeposit,
  getDepositsByMonth,
  getDepositById,
  updateDeposit,
  deleteDeposit,
};
