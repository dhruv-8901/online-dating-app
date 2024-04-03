import express from "express";
import { logo } from "../src/common/helper";
import { baseUrl } from "../src/common/config/constant.config";
import loginRoutes from "../src/admin/login/login.routes";
import userRoutes from "../src/admin/user/user.routes";
import dateRoutes from "../src/admin/date/date.routes";
import venueRoutes from "../src/admin/venue/venue.routes";
import reportRoutes from "../src/admin/report/report.routes";
import authenticateAdmin from "../src/common/middlewares/authenticate-admin";
import LoginController from "../src/admin/login/login.controller";

const router = express.Router();

router.use("/login", loginRoutes);

router.use("/user", authenticateAdmin, userRoutes);

router.use("/date", authenticateAdmin, dateRoutes);

router.use("/venue", authenticateAdmin, venueRoutes);

router.use("/report", authenticateAdmin, reportRoutes);

router.get("/logout", authenticateAdmin, LoginController.adminLogout);

router.get("/", authenticateAdmin, LoginController.adminDashboard);

module.exports = router;
