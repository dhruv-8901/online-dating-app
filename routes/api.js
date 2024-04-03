import express from "express";
import authRoutes from "../src/auth/auth.routes";
import userRoutes from "../src/user/user.routes";
import peopleRoutes from "../src/people/people.routes";
import chatRoutes from "../src/chat/chat.routes";
import dateRoutes from "../src/date/date.routes";
import storeFCMToken from "../src/fcm-token/dto/store-fcm-token.dto";
import registerPushToken from "../src/fcm-token/register-token.controller";
import authenticateUser from "../src/common/middlewares/authenticate-user";
import validator from "../src/common/config/joi-validator";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", authenticateUser, userRoutes);

router.use("/people", authenticateUser, peopleRoutes);

router.use("/chat", authenticateUser, chatRoutes);

router.use("/date", authenticateUser, dateRoutes);

router.post(
  "/fcm/token",
  [authenticateUser, validator.body(storeFCMToken)],
  registerPushToken
);

export default router;
