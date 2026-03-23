import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerManager);

router.post("/login", AuthController.loginUser);

router.post("/logout", AuthController.logoutUser);

router.post("/change-password", AuthController.changePassword);

router.post("/verify-email", AuthController.verifyEmail);

router.post("/forget-password", AuthController.forgetPassword);

router.post("/reset-password", AuthController.resetPassword);

router.get("/me", AuthController.getMe);

router.get("/login/google", AuthController.googleLogin);

router.get("/google/success", AuthController.googleLoginSuccess);

router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRouter = router;
