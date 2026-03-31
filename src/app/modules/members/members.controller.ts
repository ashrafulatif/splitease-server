import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MembersService } from "./members.service";
import { Request, Response } from "express";

const getAllMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await MembersService.getAllMembers(req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Members retrieved successfully",
    data: result,
  });
});

const addMemberToHouse = catchAsync(async (req: Request, res: Response) => {
  const result = await MembersService.addMemberToHouse(req.body, req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message:
      "Member added to house successfully. Check your email for credentials.",
    data: result,
  });
});

const getMemberById = catchAsync(async (req: Request, res: Response) => {
  const { id: memberId } = req.params;
  const result = await MembersService.getMemberById(
    memberId as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Member retrieved successfully",
    data: result,
  });
});

const getHouseMember = catchAsync(async (req: Request, res: Response) => {
  const { houseId } = req.params;
  const result = await MembersService.getHouseMember(
    houseId as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "House members retrieved successfully",
    data: result,
  });
});

const deleteMember = catchAsync(async (req: Request, res: Response) => {
  const { id: memberId } = req.params;
  const result = await MembersService.deleteMember(
    memberId as string,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Member deleted successfully",
    data: result,
  });
});

export const MembersController = {
  addMemberToHouse,
  getAllMembers,
  getMemberById,
  getHouseMember,
  deleteMember,
};
