import Chat from "../../model/chat";
import { baseUrl } from "../common/config/constant.config";
import mongoose from "mongoose";
import {
  DATE_IDEA_STATUS,
  PAGINATION,
  ROLE,
} from "../common/constants/constant";
import Dates from "../../model/dates";
import DateServices from "../date/date.service";
import GetDatesListResources from "../date/resources/get-dates-list.resource";
import BlockUser from "../../model/blockUser";
import moment from "moment";
const ObjectId = mongoose.Types.ObjectId;

class ChatServices {
  /**
   * save file
   * @param {*} file
   * @returns
   */
  static async saveFileOnServer(file) {
    return file ? baseUrl(file.destination + "/" + file.filename) : null;
  }

  /**
   * Get chat list
   * @param {*} authUser
   */
  static async getChatList(
    type,
    perPage = PAGINATION.DEFAULT_PER_PAGE,
    currentPage = PAGINATION.DEFAULT_PAGE,
    authUser
  ) {
    let skip = Number((currentPage - 1) * perPage);
    let limit = Number(perPage);

    const pipeline = [
      {
        $match: {
          $or: [
            { userId: ObjectId(authUser._id) },
            { peopleId: ObjectId(authUser._id) },
          ],
        },
      },
    ];

    if (type == "2") {
      pipeline.push({
        $match: {
          $or: [
            {
              status: DATE_IDEA_STATUS.CANCEL,
              cancelledAt: {
                $gte: new Date(moment().subtract(30, "d").startOf("D")),
              },
            },
            {
              status: DATE_IDEA_STATUS.CONFIRM,
            },
            {
              status: {
                $in: [
                  DATE_IDEA_STATUS.SENT,
                  DATE_IDEA_STATUS.RESCHEDULE,
                  DATE_IDEA_STATUS.SUGGESTION,
                ],
              },
              cancelledAt: {
                $ne: null,
              },
              // cancelledBy: {
              //   $ne: null,
              // },
            },
          ],
        },
      });
    } else {
      pipeline.push({
        $match: {
          $or: [
            {
              status: DATE_IDEA_STATUS.CANCEL,
              cancelledAt: {
                $lt: new Date(moment().subtract(30, "d").startOf("D")),
              },
            },
            {
              status: DATE_IDEA_STATUS.COMPLETED,
            },
          ],
        },
      });
    }

    pipeline.push(
      {
        $addFields: {
          partnerId: {
            $cond: {
              if: { $eq: ["$peopleId", ObjectId(authUser._id)] },
              then: "$userId",
              else: "$peopleId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "partnerId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "chats",
          let: { partnerId: "$partnerId", authUserId: ObjectId(authUser._id) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$senderId", "$$partnerId"] },
                        { $eq: ["$receiverId", "$$authUserId"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$receiverId", "$$partnerId"] },
                        { $eq: ["$senderId", "$$authUserId"] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $addFields: {
                partnerId: {
                  $cond: {
                    if: { $eq: ["$senderId", ObjectId(authUser._id)] },
                    then: "$receiverId",
                    else: "$senderId",
                  },
                },
                unseen: {
                  $cond: {
                    if: {
                      $and: [
                        { $eq: ["$receiverId", ObjectId(authUser._id)] },
                        { $eq: ["$seenAt", null] },
                      ],
                    },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
            {
              $sort: { created_at: -1 },
            },
            {
              $group: {
                _id: "$partnerId",
                lastMessage: { $first: "$$ROOT" },
                unseenCount: { $sum: "$unseen" },
              },
            },
          ],
          as: "chat",
        },
      },
      {
        $unwind: {
          path: "$chat",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          updatedAtExists: {
            $cond: {
              if: { $eq: [{ $type: "$updatedAt" }, "date"] },
              then: 1,
              else: 0,
            },
          },
          lastMessageExists: {
            $cond: {
              if: { $eq: [{ $type: "$chat.lastMessage.created_at" }, "date"] },
              then: 1,
              else: 0,
            },
          },
        },
      },
      {
        $addFields: {
          maxDate: {
            $max: [
              { $ifNull: ["$updated_at", null] },
              { $ifNull: ["$chat.lastMessage.created_at", null] },
            ],
          },
        },
      },
      {
        $sort: {
          maxDate: -1,
        },
      }
    );

    const data = await Dates.aggregate([
      ...pipeline,
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalData = await Dates.aggregate(pipeline);

    return {
      data,
      meta: {
        total: totalData.length,
        get lastPage() {
          return this.total ? Math.ceil(Number(this.total / this.perPage)) : 0;
        },
        perPage: +perPage,
        currentPage: +currentPage,
      },
    };
  }

  /**
   * get chat list by userId
   * @param {*} userId
   * @param {*} authUser
   */
  static async getUserChatListByUserId(
    userId,
    dateId,
    perPage = PAGINATION.DEFAULT_PER_PAGE,
    currentPage = PAGINATION.DEFAULT_PAGE,
    authUser
  ) {
    let skip = Number((currentPage - 1) * perPage);
    let limit = Number(perPage);
    let data = [];
    let totalData = [];
    let isUserBlocked;

    const dateExist = await Dates.aggregate([
      {
        $match: {
          _id: ObjectId(dateId),
          $or: [
            {
              userId: ObjectId(authUser._id),
              peopleId: ObjectId(userId),
            },
            {
              userId: ObjectId(userId),
              peopleId: ObjectId(authUser._id),
            },
          ],
        },
      },
      {
        $addFields: {
          partnerId: {
            $cond: {
              if: { $eq: ["$peopleId", ObjectId(authUser._id)] },
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
      // {
      //   $unwind: "$venueDetails",
      // },
    ]);

    if (dateExist.length > 0) {
      const pipeline = [
        {
          $match: {
            $or: [
              {
                senderId: ObjectId(authUser._id),
                receiverId: ObjectId(userId),
              },
              {
                senderId: ObjectId(userId),
                receiverId: ObjectId(authUser._id),
              },
            ],
          },
        },
        {
          $sort: {
            created_at: -1,
          },
        },
      ];

      data = await Chat.aggregate([
        ...pipeline,
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      totalData = await Chat.aggregate(pipeline);

      isUserBlocked = await BlockUser.findOne({
        $or: [
          {
            userId: dateExist[0].userId,
            blockedBy: dateExist[0].peopleId,
          },
          {
            userId: dateExist[0].peopleId,
            blockedBy: dateExist[0].userId,
          },
        ],
      });
    }

    const newDateDetail = new GetDatesListResources(dateExist);

    return {
      isUserBlocked: isUserBlocked ? true : false,
      dateDetail: newDateDetail.length > 0 ? newDateDetail[0] : {},
      data,
      meta: {
        total: totalData.length,
        get lastPage() {
          return this.total ? Math.ceil(Number(this.total / this.perPage)) : 0;
        },
        perPage: +perPage,
        currentPage: +currentPage,
      },
    };
  }
}

export default ChatServices;
