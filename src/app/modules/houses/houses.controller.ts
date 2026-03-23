import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { HouseService } from "./houses.service";

const getAllHouses = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseService.getAllHouses();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Houses retrieved successfully",
    data: result,
  });
});

const getMyHouses = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseService.getMyHouses(req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Houses retrieved successfully",
    data: result,
  });
});

const createHouse = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseService.createHouse(req.body, req.user);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "House created successfully",
    data: result,
  });
});

const updateHouse = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseService.updateHouse(
    req.params.id as string,
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "House updated successfully",
    data: result,
  });
});

const getHouseById = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseService.getHouseById(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "House retrieved successfully",
    data: result,
  });
});

const deleteHouse = catchAsync(async (req: Request, res: Response) => {
  const result = await HouseService.deleteHouse(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "House deleted successfully",
    data: result,
  });
});

export const HouseController = {
  getAllHouses,
  createHouse,
  updateHouse,
  getHouseById,
  deleteHouse,
  getMyHouses,
};
