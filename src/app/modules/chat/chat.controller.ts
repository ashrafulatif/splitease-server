import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ChatService } from "./chat.service";

const getChatResponse = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  const result = await ChatService.getChatResponse(message as string, req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Chat response generated successfully",
    data: { response: result },
  });
});

export const ChatController = {
  getChatResponse,
};
