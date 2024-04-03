import express from "express";
import asyncHandler from "express-async-handler";
import ReportController from "./report.controller";

const router = express.Router();

router.get("/list", asyncHandler(ReportController.getAllReports));

router.get("/", asyncHandler(ReportController.getReportPage));

export default router;
