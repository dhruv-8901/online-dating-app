import Venue from "../../../model/venue";
import VenueTiming from "../../../model/venueTiming";
import { checkIdIsValid } from "../../common/helper";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

class VenueServices {
  /**
   * Get all venues
   * @param {*} filter
   */
  static async getAllVenues(filter) {
    const search = filter.search.value ? filter.search.value : "";
    const skip = +filter.start;
    const limit = +filter.length + +filter.start;
    const data = await Venue.find();
    const filterData = await Venue.find({
      venue: { $regex: `.*${search}.*`, $options: "i" },
    })
      .skip(skip)
      .limit(limit);

    return { data, filterData };
  }

  /**
   * Add venue
   * @param {*} venue
   */
  static async addVenue(data) {
    const jsonString = Object.keys(data)[0];
    const parsedData = JSON.parse(jsonString);
    const venue = await Venue.create({ venue: parsedData.venue });
    parsedData.dateTimeArray.forEach(async (item) => {
      if (item.startTime && item.endTime) {
        await VenueTiming.create({
          venueId: venue._id,
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
        });
      }
    });
    return;
  }

  /**
   * Delete venue from id
   * @param {*} venueId
   */
  static async deleteVenueFromId(venueId) {
    checkIdIsValid(venueId);
    return Venue.deleteOne({ _id: venueId });
  }

  /**
   * Get venue data from Id
   * @param {*} venueId
   */
  static async getVenueDataFromId(venueId) {
    return await Venue.aggregate([
      {
        $match: {
          _id: ObjectId(venueId),
        },
      },
      {
        $lookup: {
          from: "venue_timings",
          localField: "_id",
          foreignField: "venueId",
          as: "venueTiming",
        },
      },
    ]);
  }

  /**
   * Edit venue from id
   * @param {*} venueId
   * @param {*} venue
   */
  static async editVenueFromId(venueId, data) {
    const jsonString = Object.keys(data)[0];
    const parsedData = JSON.parse(jsonString);
    if (!(await Venue.findOne({ _id: venueId }))) {
      return;
    }
    await Venue.updateOne({ _id: venueId }, { venue: parsedData.venue });
    await VenueTiming.deleteMany({ venueId });
    parsedData.dateTimeArray.forEach(async (item) => {
      if (item.startTime && item.endTime) {
        await VenueTiming.create({
          venueId,
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
        });
      }
    });
    return;
  }
}

export default VenueServices;
