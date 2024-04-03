import express from "express";
import asyncHandler from "express-async-handler";
import LoginController from "./login.controller";

const router = express.Router();

router.get("/", asyncHandler(LoginController.getLoginPage));

router.post("/", asyncHandler(LoginController.adminlogin));

export default router;
