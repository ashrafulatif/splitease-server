import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getMonthlySummary = catchAsync(async (req: Request, res: Response) => {
  const { monthId } = req.params;

  const result = await StatsService.getMonthlySummary(
    monthId as string,
    req.user,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Monthly summary retrieved successfully",
    data: result,
  });
});

export const StatsController = {
  getMonthlySummary,
};
