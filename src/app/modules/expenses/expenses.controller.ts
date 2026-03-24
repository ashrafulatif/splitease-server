import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ExpenseService } from "./expenses.service";

const createExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.createExpense(req.body, req.user);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Expense created successfully",
    data: result,
  });
});

const getExpensesByMonth = catchAsync(async (req: Request, res: Response) => {
  const monthId = req.query.monthId as string;

  if (!monthId) {
    return sendResponse(res, {
      statusCode: status.BAD_REQUEST,
      success: false,
      message: "monthId query parameter is required",
      data: null,
    });
  }

  const result = await ExpenseService.getExpensesByMonth(monthId, req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Expenses retrieved successfully",
    data: result,
  });
});

const getExpenseById = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.getExpenseById(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Expense retrieved successfully",
    data: result,
  });
});

const updateExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.updateExpense(
    req.params.id as string,
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Expense updated successfully",
    data: result,
  });
});

const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseService.deleteExpense(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Expense deleted successfully",
    data: result,
  });
});

export const ExpenseController = {
  createExpense,
  getExpensesByMonth,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
