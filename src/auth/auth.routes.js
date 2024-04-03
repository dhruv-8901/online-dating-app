import express from "express";
import AuthController from "./auth.controller";
import asyncHandler from "express-async-handler";
import authenticateUser from "../common/middlewares/authenticate-user";
import validator from "../common/config/joi-validator";
import registerUserDto from "./dtos/register-user.dto";
import addEmailDto from "./dtos/add-email.dto";
import otpVerificationDto from "./dtos/otp-verification.dto";
import resendOtpDto from "./dtos/resend-otp.dto";
import loginDto from "./dtos/login.dto";

const router = express.Router();

router.post(
  "/login",
  validator.body(loginDto),
  asyncHandler(AuthController.loginUser)
);

router.post(
  "/register",
  validator.body(registerUserDto),
  asyncHandler(AuthController.registerUser)
);

router.post("/refresh-token", asyncHandler(AuthController.refreshToken));

router.post(
  "/email",
  authenticateUser,
  validator.body(addEmailDto),
  asyncHandler(AuthController.addEmail)
);

router.post(
  "/otp-verification",
  validator.body(otpVerificationDto),
  asyncHandler(AuthController.userOtpVerification)
);

router.post(
  "/resend-otp",
  validator.body(resendOtpDto),
  asyncHandler(AuthController.resendOtp)
);

router.post(
  "/logout",
  authenticateUser,
  asyncHandler(AuthController.logoutUser)
);

router.post("/delete-by-phone", asyncHandler(AuthController.deleteByPhone));

export default router;
