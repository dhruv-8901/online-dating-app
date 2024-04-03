import Dates from "../../../model/dates";
import User from "../../../model/user";
import {
  ACCOUNT_STATUS,
  APPROVE_STATUS,
  DATE_IDEA_STATUS,
  IS_BLOCKED,
  NOTIFICATION_TYPE,
  USER_TYPE,
} from "../../common/constants/constant";
import mongoose from "mongoose";
import { NotFoundException } from "../../error-exception";
import { stat } from "fs";
import BlockHistory from "../../../model/blockHistory";
import moment from "moment";
import { sendNotificationToSingleUser } from "../../common/helper";
const ObjectId = mongoose.Types.ObjectId;

class UserService {
  /**
   * Get all users
   * @param {*} filter
   */
  static async getAllUsersData(filter, status) {
    const search = filter.search.value ? filter.search.value : "";
    const skip = +filter.start;
    const limit = +filter.length + +filter.start;
    const pipeline = [
      {
        $match: {
          status: 10,
          approvedStatus:
            status == APPROVE_STATUS.PENDING
              ? APPROVE_STATUS.PENDING
              : { $in: [APPROVE_STATUS.APPROVED, APPROVE_STATUS.REJECTED] },
        },
      },
      {
        $lookup: {
          from: "dates",
          localField: "_id",
          foreignField: "cancelledBy",
          pipeline: [
            {
              $match: {
                status: DATE_IDEA_STATUS.CANCEL,
                cancelledAt: {
                  $gte: new Date(moment().subtract(30, "d").startOf("D")),
                  $lt: new Date(moment().add(1, "d").startOf("D")),
                },
              },
            },
          ],
          as: "cancelDates",
        },
      },
      {
        $lookup: {
          from: "block_histories",
          localField: "_id",
          foreignField: "userId",
          as: "blockData",
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              email: {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              name: {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              address: {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    const data = await User.aggregate(pipeline);

    const filterData = await User.aggregate([
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
   * Get user dates history from userId
   * @param {*} userId
   * @param {*} filter
   */
  static async getUserDatesHistoryFromUserId(userId, filter) {
    const search = filter.search.value ? filter.search.value : "";
    const skip = +filter.start;
    const limit = +filter.length + +filter.start;
    const pipeline = [
      {
        $match: {
          $or: [{ userId: ObjectId(userId) }, { peopleId: ObjectId(userId) }],
        },
      },
      {
        $addFields: {
          partnerId: {
            $cond: {
              if: { $eq: ["$peopleId", ObjectId(userId)] },
              then: "$userId",
              else: "$peopleId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "partnerId",
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

  /**
   * block unblock user from userId
   * @param {*} status
   * @param {*} userId
   */
  static async blockUnblockUserFromId(status, userId) {
    if (!(await User.findOne({ _id: userId }))) {
      throw new NotFoundException("User not found!");
    }

    if (status == IS_BLOCKED.TRUE) {
      await BlockHistory.create({
        userId,
        type: USER_TYPE.ADMIN,
        blockedAt: new Date(),
      });
    }

    return await User.updateOne({ _id: userId }, { isBlocked: status });
  }

  /**
   * Approve or reject user from userId
   * @param {*} status
   * @param {*} userId
   */
  static async approveRejectUserFromId(status, userId) {
    if (!(await User.findOne({ _id: userId }))) {
      throw new NotFoundException("User not found!");
    }

    if (status == APPROVE_STATUS.APPROVED) {
      await sendNotificationToSingleUser(
        userId,
        {
          title: "Your Membership has been Approved.",
          body: "Your Membership has been Approved.",
        },
        {
          userId: userId.toString(),
          type: NOTIFICATION_TYPE.MEMBERSHIP_APPROVAL,
        }
      );
    }

    return await User.updateOne({ _id: userId }, { approvedStatus: status });
  }
}

export default UserService;
