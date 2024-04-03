import express from "express";
import asyncHandler from "express-async-handler";
import DateController from "./date.controller";

const router = express.Router();

router.get("/all", asyncHandler(DateController.getAllDates));

router.get("/cancelled", asyncHandler(DateController.getCancelledDatePage));

router.get(
  "/cancelled/list",
  asyncHandler(DateController.getCancelledDatesListing)
);

router.get("/", asyncHandler(DateController.getDatePage));

export default router;
