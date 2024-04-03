import moment from "moment";
import Dates from "../../../model/dates";
import { DATE_IDEA_STATUS } from "../../common/constants/constant";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

class DateServices {
  /**
   * Get all dates
   * @param {*} filter
   */
  static async getAllDates(filter) {
    const search = filter.search.value ? filter.search.value : "";
    const skip = +filter.start;
    const limit = +filter.length + +filter.start;
    const venueId = filter.venueId;
    const startDate = filter.startDate;
    const endDate = filter.endDate;

    const pipeline = [];

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          dateAndTime: {
            $gte: new Date(moment(startDate).startOf("D")),
            $lt: new Date(moment(endDate).add(1, "d").startOf("D")),
          },
        },
      });
    }
    if (venueId) {
      pipeline.push({
        $match: {
          venueId: ObjectId(venueId),
        },
      });
    }
    if (venueId) {
      pipeline.push({
        $match: {
          venueId: ObjectId(venueId),
        },
      });
    }
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "venueDetails.venue": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              "partnerDetails.name": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              "userDetails.name": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
          ],
        },
      });
    }
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "peopleId",
          foreignField: "_id",
          as: "partnerDetails",
        },
      },
      {
        $unwind: "$partnerDetails",
      },
      {
        $lookup: {
          from: "venues",
          localField: "venueId",
          foreignField: "_id",
          as: "venueDetails",
        },
      },
      {
        $unwind: "$venueDetails",
      }
    );

    const data = await Dates.aggregate(pipeline);

    const filterData = await Dates.aggregate([
      ...pipeline,
      {
        $sort: { created_at: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return { data, filterData };
  }

  /**
   * Get cancelled dates
   * @param {*} filter
   */
  static async getCancelledDatesListing(filter) {
    const search = filter.search.value ? filter.search.value : "";
    const skip = +filter.start;
    const limit = +filter.length + +filter.start;
    const venueId = filter.venueId;
    const pipeline = [
      {
        $match: {
          status: DATE_IDEA_STATUS.CANCEL,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "cancelledBy",
          foreignField: "_id",
          as: "cancelledByDetails",
        },
      },
      {
        $unwind: "$cancelledByDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "peopleId",
          foreignField: "_id",
          as: "partnerDetails",
        },
      },
      {
        $unwind: "$partnerDetails",
      },
      {
        $lookup: {
          from: "venues",
          localField: "venueId",
          foreignField: "_id",
          as: "venueDetails",
        },
      },
      {
        $unwind: "$venueDetails",
      },
    ];
    if (venueId) {
      pipeline.push({
        $match: {
          venueId: ObjectId(venueId),
        },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "venueDetails.venue": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              "partnerDetails.name": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              "userDetails.name": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    const data = await Dates.aggregate(pipeline);

    const filterData = await Dates.aggregate([
      ...pipeline,
      {
        $sort: { created_at: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return { data, filterData };
  }
}

export default DateServices;
