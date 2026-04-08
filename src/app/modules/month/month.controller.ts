import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MonthService } from "./month.service";

const createMonth = catchAsync(async (req: Request, res: Response) => {
  const result = await MonthService.createMonth(req.body, req.user);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Month created successfully",
    data: result,
  });
});

const getHouseMonths = catchAsync(async (req: Request, res: Response) => {
  const result = await MonthService.getHouseMonths(
    req.params.houseId as string,
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Months retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMonthById = catchAsync(async (req: Request, res: Response) => {
  const result = await MonthService.getMonthById(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Month retrieved successfully",
    data: result,
  });
});

const deleteMonth = catchAsync(async (req: Request, res: Response) => {
  const result = await MonthService.deleteMonth(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Month deleted successfully",
    data: result,
  });
});

export const MonthController = {
  createMonth,
  getHouseMonths,
  getMonthById,
  deleteMonth,
};
