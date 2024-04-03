import express from "express";
import asyncHandler from "express-async-handler";
import validator from "../common/config/joi-validator";
import authenticateUser from "../common/middlewares/authenticate-user";
import UserServices from "./user.service";
import UserController from "./user.controller";
import storeFiles from "../common/middlewares/storeFile";
import photoIdDto from "./dtos/photoId.dto";
import reactionTypeDto from "../people/dto/reactionType.dto";
import updateUserDto from "./dtos/update-user.dto";
const router = express.Router();

router.delete(
  "/photo/:photoId",
  validator.params(photoIdDto),
  asyncHandler(UserController.deletePhotoById)
);

router.post(
  "/account",
  validator.body(reactionTypeDto),
  asyncHandler(UserController.userAccountAction)
);

router.get("/tab-bar", asyncHandler(UserController.getTabBarData));

router.put(
  "/",
  storeFiles("media/photo", "photos", "array"),
  validator.body(updateUserDto),
  asyncHandler(UserController.updateUserData)
);

router.get("/", asyncHandler(UserController.getUserData));

export default router;
