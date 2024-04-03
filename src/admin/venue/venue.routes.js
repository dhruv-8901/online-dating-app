import express from "express";
import asyncHandler from "express-async-handler";
import VenueController from "./venue.controller";

const router = express.Router();

router.get("/list", asyncHandler(VenueController.getAllVenues));

router.get("/add", asyncHandler(VenueController.getAddVenuePage));

router.post("/add", asyncHandler(VenueController.addVenue));

router.delete(
  "/delete/:venueId",
  asyncHandler(VenueController.deleteVenueFromId)
);

router.get("/edit/:venueId", asyncHandler(VenueController.getEditVenuePage));

router.post("/edit/:venueId", asyncHandler(VenueController.editVenueFromId));

router.get("/", asyncHandler(VenueController.getVenuePage));

export default router;
