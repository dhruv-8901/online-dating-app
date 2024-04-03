import express from "express";
import asyncHandler from "express-async-handler";
import DateController from "./date.controller";
import validator from "../common/config/joi-validator";
import dateTypeDto from "./dto/dateType.dto";
import dateIdDto from "./dto/dateId.dto";
import peopleIdDto from "../people/dto/peopleId.dto";
import dateDto from "./dto/date.dto";
import updateDateDto from "./dto/updateDate.dto";
import checkAccountIsActivated from "../common/middlewares/check-account-status";
import venueIdDto from "./dto/venueId.dto";
import venueDateDto from "./dto/venueDate.dto";
import postConfirmationDto from "./dto/postConfirmation.dto";

const router = express.Router();

router.get("/venues", asyncHandler(DateController.getVenueList));

router.get(
  "/venues/available-date/:venueId",
  validator.params(venueIdDto),
  asyncHandler(DateController.getVenueAvailableDateByVenueId)
);

router.get(
  "/venues/available-time/:venueId",
  validator.params(venueIdDto),
  validator.query(venueDateDto),
  asyncHandler(DateController.getVenueAvailableTimeByVenueId)
);

router.post(
  "/:dateId",
  validator.params(dateIdDto),
  validator.body(dateTypeDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(DateController.confirmOrCancelDealIdeaByDateId)
);

router.post(
  "/post-confirmation/:dateId",
  validator.params(dateIdDto),
  validator.body(postConfirmationDto),
  asyncHandler(DateController.postConfirmationByDateId)
);

router.get(
  "/post-confirmation/pending",
  asyncHandler(DateController.pendingPostConfirmation)
);

router.post(
  "/idea/:peopleId",
  validator.params(peopleIdDto),
  validator.body(dateDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(DateController.giveDateIdeaToLikedPeople)
);

router.post(
  "/suggestion/idea/:dateId",
  validator.params(dateIdDto),
  validator.body(dateDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(DateController.giveDateIdeaToSuggestedPeople)
);

router.put(
  "/idea/change/:dateId",
  validator.params(dateIdDto),
  validator.body(dateDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(DateController.changeDate)
);

router.put(
  "/idea/cancel/:dateId",
  validator.params(dateIdDto),
  asyncHandler(checkAccountIsActivated),
  asyncHandler(DateController.cancelDateIdea)
);

router.get("/", asyncHandler(DateController.getDateList));

export default router;
