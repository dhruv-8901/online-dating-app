import express from "express";
import PeopleController from "./people.controller";
import asyncHandler from "express-async-handler";
import validator from "../common/config/joi-validator";
import peopleIdDto from "./dto/peopleId.dto";
import reactionTypeDto from "./dto/reactionType.dto";
import checkAccountIsActivated from "../common/middlewares/check-account-status";

const router = express.Router();

router.get(
  "/likes-you",
  asyncHandler(PeopleController.getListOfPeopleLikesYou)
);

router.post(
  "/reaction/:peopleId",
  validator.params(peopleIdDto),
  validator.body(reactionTypeDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(PeopleController.addReactionOnToThePeople)
);

router.post(
  "/action/:peopleId",
  validator.params(peopleIdDto),
  validator.body(reactionTypeDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(PeopleController.blockUnblockPeopleFromId)
);

router.post(
  "/match/reaction/:peopleId",
  validator.params(peopleIdDto),
  validator.body(reactionTypeDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(PeopleController.addReactionOnToTheLikedPeople)
);

router.post(
  "/report/:peopleId",
  validator.params(peopleIdDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(PeopleController.reportPeopleFromId)
);

router.post(
  "/request/:userId",
  asyncHandler(PeopleController.sendPeopleConnectRequest)
);

router.post(
  "/request/approve/:requestId",
  asyncHandler(PeopleController.approvePeopleConnectRequest)
);

router.get("/:peopleId", asyncHandler(PeopleController.getPeopleDataFromId));

router.get(
  "/",
  asyncHandler(checkAccountIsActivated),
  asyncHandler(PeopleController.getPeopleList)
);

module.exports = router;
