import { Router } from "express";
import { AuthController } from "./auth.controller";
import { CheckAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post("/register", AuthController.registerManager);

router.post("/login", AuthController.loginUser);

router.post(
  "/logout",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.logoutUser,
);

router.post(
  "/change-password",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.changePassword,
);

router.post("/verify-email", AuthController.verifyEmail);

router.post("/resend-otp", AuthController.resendOtp);

router.post("/forget-password", AuthController.forgetPassword);

router.post("/reset-password", AuthController.resetPassword);

router.get(
  "/me",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.getMe,
);

router.patch(
  "/profile",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  multerUpload.single("image"),
  AuthController.updateProfile,
);

router.get("/login/google", AuthController.googleLogin);

router.get("/google/success", AuthController.googleLoginSuccess);

router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRouter = router;
