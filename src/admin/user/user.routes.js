import express from "express";
import asyncHandler from "express-async-handler";
import UserController from "./user.controller";

const router = express.Router();

router.get("/all/:status", asyncHandler(UserController.getAllUsersData));

router.get(
  "/date-history/:userId/data",
  asyncHandler(UserController.getUserDatesHistoryFromUserId)
);

router.get(
  "/date-history/:userId",
  asyncHandler(UserController.getUserDatesHistoryFromUserIdPage)
);

router.post(
  "/action/:userId",
  asyncHandler(UserController.blockUnblockUserFromId)
);

router.post(
  "/approve/:userId",
  asyncHandler(UserController.approveRejectUserFromId)
);

router.get("/swipe-limit", asyncHandler(UserController.getSwipeLimitPage));

router.post("/swipe-limit", asyncHandler(UserController.setSwipeLimit));

router.get("/pending", asyncHandler(UserController.getPendingUserPage));

router.get("/", asyncHandler(UserController.getUserPage));

export default router;
