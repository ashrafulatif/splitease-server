import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export const login = async (req: Request, res: Response) => {
  const payload = req.body;

  console.log(payload);

  const result = await AuthService.loginUser(payload);
  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: result,
  });
};

export const AuthController = {
  login,
};
