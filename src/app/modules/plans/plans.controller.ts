import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PlansService } from "./plans.service";

const getPlans = catchAsync(async (_req: Request, res: Response) => {
	const result = await PlansService.getPlans();

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Plans retrieved successfully",
		data: result,
	});
});

const createPlan = catchAsync(async (req: Request, res: Response) => {
	const result = await PlansService.createPlan(req.body);

	sendResponse(res, {
		statusCode: status.CREATED,
		success: true,
		message: "Plan created successfully",
		data: result,
	});
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
	const result = await PlansService.updatePlan(req.params.id as string, req.body);

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Plan updated successfully",
		data: result,
	});
});

const deletePlan = catchAsync(async (req: Request, res: Response) => {
	const result = await PlansService.deletePlan(req.params.id as string);

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Plan deleted successfully",
		data: result,
	});
});

export const PlansController = {
	getPlans,
	createPlan,
	updatePlan,
	deletePlan,
};

