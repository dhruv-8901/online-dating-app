import express from "express";
import storeFiles from "../common/middlewares/storeFile";
import ChatController from "./chat.controller";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.get("/:userId", asyncHandler(ChatController.getUserChatListByUserId));

router.get("/", asyncHandler(ChatController.getChatList));

router.post(
  "/",
  storeFiles("media/chat", "file"),
  asyncHandler(ChatController.saveFileOnServer)
);
export default router;
