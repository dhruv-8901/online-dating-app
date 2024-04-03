import express from "express";
import apiRoutes from "./api";
import webRoutes from "./web";
import adminRoutes from "./admin";

const router = express.Router();

router.use("/api/v1", apiRoutes);

router.use("/admin", adminRoutes);

router.use("/", webRoutes);

export default router;
