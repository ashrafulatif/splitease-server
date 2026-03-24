
import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MealService } from "./meal.service";

const addMeal = catchAsync(async (req: Request, res: Response) => {
    const result = await MealService.addMeal(req.body, req.user);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Meal added successfully",
        data: result,
    });
});

const getAllMeals = catchAsync(async (req: Request, res: Response) => {
    const result = await MealService.getAllMeals(req.params.monthId as string, req.user);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Meals retrieved successfully",
        data: result,
    });
});

const getMealById = catchAsync(async (req: Request, res: Response) => {
    const result = await MealService.getMealById(req.params.id as string, req.user);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Meal retrieved successfully",
        data: result,
    });
});

const updateMeal = catchAsync(async (req: Request, res: Response) => {
    const result = await MealService.updateMeal(
        req.params.id as string,
        req.body,
        req.user,
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Meal updated successfully",
        data: result,
    });
});

const deleteMeal = catchAsync(async (req: Request, res: Response) => {
    const result = await MealService.deleteMeal(req.params.id as string, req.user);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Meal deleted successfully",
        data: result,
    });
});

export const MealController = {
    addMeal,
    getAllMeals,
    getMealById,
    updateMeal,
    deleteMeal,
};