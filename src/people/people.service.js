import mongoose from "mongoose";
import {
  ACCOUNT_STATUS,
  APPROVE_STATUS,
  DATE_IDEA_STATUS,
  NOTIFICATION_TYPE,
  PAGINATION,
  PEOPLE,
  USER_TYPE,
} from "../common/constants/constant";
import User from "../../model/user";
import PeopleReaction from "../../model/peopleReaction";
import { BadRequestException } from "../error-exception";
import BlockHistory from "../../model/blockHistory";
import BlockUser from "../../model/blockUser";
import Report from "../../model/report";
import Dates from "../../model/dates";
import { sendNotificationToSingleUser } from "../common/helper";
import Match from "../../model/match";
import moment from "moment";
import SwipeLimit from "../../model/swipeLimit";
const ObjectId = mongoose.Types.ObjectId;

class PeopleService {
  /**
   * Get people list with filter
   * @param {*} filter
   * @param {*} authUser
   * @returns
   */
  static async getPeopleList(
    perPage = PAGINATION.DEFAULT_PER_PAGE,
    currentPage = PAGINATION.DEFAULT_PAGE,
    authUser
  ) {
    let skip = Number((currentPage - 1) * perPage);
    let limit = Number(perPage);

    const likedUserIds = await PeopleReaction.distinct("peopleId", {
      userId: authUser._id,
    });
    const usersLikeMeIds = await PeopleReaction.distinct("userId", {
      peopleId: authUser._id,
    });

    const pipeline = [
      {
        $match: {
          _id: {
            $nin: [ObjectId(authUser._id), ...likedUserIds, ...usersLikeMeIds],
          },
          isProfileCompleted: true,
          approvedStatus: {
            $ne: APPROVE_STATUS.REJECTED,
          },
          accountStatus: ACCOUNT_STATUS.ACTIVE,
          gender: {
            $in: authUser.likeToDate,
          },
        },
      },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [{ $subtract: [new Date(), "$birthDate"] }, 31536000000],
            },
          },
        },
      },
      {
        $match: {
          age: {
            $gte: authUser.agePreferenceFrom,
            $lte: authUser.agePreferenceTo,
          },
        },
      },
      {
        $lookup: {
          from: "block_users",
          let: { userId: "$_id", blockedBy: ObjectId(authUser._id) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$userId", "$$userId"] },
                        { $eq: ["$blockedBy", "$$blockedBy"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$userId", "$$blockedBy"] },
                        { $eq: ["$blockedBy", "$$userId"] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "blockData",
        },
      },
      {
        $match: {
          blockData: { $size: 0 },
        },
      },
    ];

    const data = await User.aggregate([
      ...pipeline,
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalData = await User.aggregate(pipeline);

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
   * Get people data from peopleId
   * @param {*} peopleId
   * @param {*} authUser
   */
  static async getPeopleDataFromId(peopleId, authUser) {
    return await User.aggregate([
      {
        $match: {
          _id: ObjectId(peopleId),
        },
      },
      {
        $lookup: {
          from: "block_users",
          let: { userId: "$_id", blockedBy: ObjectId(authUser._id) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$userId", "$$userId"] },
                        { $eq: ["$blockedBy", "$$blockedBy"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$userId", "$$blockedBy"] },
                        { $eq: ["$blockedBy", "$$userId"] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "blockData",
        },
      },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$birthDate"] },
                31536000000, // milliseconds in a year
              ],
            },
          },
        },
      },
    ]);
  }

  /**
   * Get list of people which likes you
   * @param {*} filter
   * @param {*} authUser
   * @returns
   */
  static async getListOfPeopleLikesYou(
    perPage = PAGINATION.DEFAULT_PER_PAGE,
    currentPage = PAGINATION.DEFAULT_PAGE,
    authUser
  ) {
    let skip = Number((currentPage - 1) * perPage);
    let limit = Number(perPage);

    const pipeline = [
      {
        $match: {
          peopleId: ObjectId(authUser._id),
          type: PEOPLE.LIKE,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "partnerDetails",
        },
      },
      {
        $unwind: "$partnerDetails",
      },
      {
        $lookup: {
          from: "matches",
          let: { reactionUserId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$userId", "$$reactionUserId"] },
                        { $eq: ["$peopleId", ObjectId(authUser._id)] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$userId", ObjectId(authUser._id)] },
                        { $eq: ["$peopleId", "$$reactionUserId"] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "matchInfo",
        },
      },
      {
        $match: {
          matchInfo: { $size: 0 },
        },
      },
    ];

    const data = await PeopleReaction.aggregate([
      ...pipeline,
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalData = await PeopleReaction.aggregate(pipeline);

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
   * Add reaction on to the people
   * @param {*} peopleId
   * @param {*} type
   * @param {*} authUser
   */
  static async addReactionOnToThePeople(peopleId, type, authUser) {
    const poepleData = await User.findOne({ _id: peopleId });
    if (!poepleData || authUser._id.equals(ObjectId(peopleId))) {
      throw new BadRequestException("Invalid user");
    }

    let dailyLikeLimitExceed = false;

    const alreadyReacted = await PeopleReaction.findOne({
      peopleId,
      userId: authUser._id,
    });

    if (alreadyReacted) {
      throw new BadRequestException("You already reacted on this user");
    }

    if (type == PEOPLE.LIKE) {
      const todaysLikedPeople = await PeopleReaction.find({
        userId: authUser._id,
        type: PEOPLE.LIKE,
        created_at: {
          $gte: new Date(moment().startOf("D")),
          $lte: new Date(moment().endOf("D")),
        },
      });
      const swipeLimit = await SwipeLimit.findOne();

      if (swipeLimit) {
        if (todaysLikedPeople.length > swipeLimit.limit) {
          dailyLikeLimitExceed = true;
          return dailyLikeLimitExceed;
        }
      }

      await sendNotificationToSingleUser(
        peopleId,
        {
          title: `${authUser.name} Liked You.`,
          body: `${authUser.name} Liked You.`,
        },
        {
          userId: authUser._id.toString(),
          type: NOTIFICATION_TYPE.LIKE,
        }
      );
    }

    await PeopleReaction.create({
      peopleId,
      userId: authUser._id,
      type,
    });

    return dailyLikeLimitExceed;
  }

  /**
   * Check people exist
   * @param {*} peopleId
   */
  static async checkPeopleExist(peopleId) {
    const people = await User.findOne({ _id: peopleId });
    if (!people) {
      throw new BadRequestException("User not found.");
    }

    return people;
  }

  /**
   * Block unblock user from Id
   * @param {*} peopleId
   * @param {*} type
   * @param {*} authUser
   */
  static async blockUnblockPeopleFromId(peopleId, type, authUser) {
    await this.checkPeopleExist(peopleId);
    if (type == 2) {
      const userBlocked = await BlockUser.findOne({
        userId: peopleId,
        blockedBy: authUser._id,
      });
      if (!userBlocked) {
        throw new BadRequestException("Invalid Unblock User Request.");
      }

      return await BlockUser.deleteOne({ _id: userBlocked._id });
    }

    if (
      await BlockUser.findOne({ userId: peopleId, blockedBy: authUser._id })
    ) {
      throw new BadRequestException("You already blocked this user.");
    }

    await Match.deleteOne({
      $or: [
        {
          userId: peopleId,
          peopleId: authUser._id,
        },
        {
          userId: authUser._id,
          peopleId: peopleId,
        },
      ],
    });

    await PeopleReaction.deleteMany({
      $or: [
        {
          userId: peopleId,
          peopleId: authUser._id,
        },
        {
          userId: authUser._id,
          peopleId: peopleId,
        },
      ],
    });

    await Dates.deleteMany(
      {
        $or: [
          {
            userId: peopleId,
            peopleId: authUser._id,
          },
          {
            userId: authUser._id,
            peopleId: peopleId,
          },
        ],
      }
      // {
      //   status: DATE_IDEA_STATUS.CANCEL,
      //   suggestionIdeaPopup: false,
      // }
    );

    const insertData = {
      userId: peopleId,
      blockedBy: authUser._id,
      blockedAt: new Date(),
    };

    await BlockUser.create(insertData);
    return await BlockHistory.create(insertData);
  }

  /**
   * Add reaction on to the liked people
   * @param {*} peopleId
   * @param {*} type
   * @param {*} authUser
   */
  static async addReactionOnToTheLikedPeople(peopleId, type, authUser) {
    const poepleData = await User.findOne({ _id: peopleId });
    if (!poepleData || authUser._id.equals(ObjectId(peopleId))) {
      throw new BadRequestException("Invalid user");
    }

    const userLikedMe = await PeopleReaction.findOne({
      peopleId: authUser._id,
      userId: peopleId,
    });

    if (!userLikedMe) {
      throw new BadRequestException("User not liked you.");
    }

    const alreadyMatched = await Match.findOne({
      $or: [
        {
          userId: peopleId,
          peopleId: authUser._id,
        },
        {
          userId: authUser._id,
          peopleId: peopleId,
        },
      ],
    });

    if (alreadyMatched) {
      throw new BadRequestException("Already matched.");
    }

    if (type == PEOPLE.LIKE) {
      await Match.create({ userId: authUser._id, peopleId });
      const newDate = await Dates.create({
        userId: authUser._id,
        peopleId,
        status: DATE_IDEA_STATUS.SUGGESTION,
        suggestionIdeaPopup: true,
      });

      return await sendNotificationToSingleUser(
        peopleId,
        {
          title: `You matched with ${authUser.name}.`,
          body: `You matched with ${authUser.name}.`,
        },
        {
          userId: authUser._id.toString(),
          dateId: newDate._id.toString(),
          type: NOTIFICATION_TYPE.MATCH,
        }
      );
    } else {
      await PeopleReaction.deleteOne({
        peopleId: authUser._id,
        userId: peopleId,
      });
      return await PeopleReaction.create({
        peopleId,
        userId: authUser._id,
        type: PEOPLE.DISLIKE,
      });
    }
  }

  /**
   * report people from Id
   * @param {*} peopleId
   * @param {*} authUser
   */
  static async reportPeopleFromId(peopleId, authUser) {
    await this.checkPeopleExist(peopleId);
    if (!(await User.findOne({ _id: peopleId }))) {
      throw new BadRequestException("User not found!");
    }

    if (await Report.findOne({ userId: peopleId, reportedBy: authUser._id })) {
      throw new BadRequestException("You already reported this user.");
    }

    const insertData = {
      userId: peopleId,
      blockedBy: authUser._id,
      blockedAt: new Date(),
    };

    await BlockUser.create(insertData);
    await BlockHistory.create(insertData);
    await Report.create({
      userId: peopleId,
      reportedBy: authUser._id,
      reportedAt: new Date(),
    });
    return await Dates.deleteMany(
      {
        $or: [
          { userId: authUser._id, peopleId },
          { peopleId: authUser._id, userId: peopleId },
        ],
      }
      // { status: DATE_IDEA_STATUS.CANCEL }
    );
  }
}

export default PeopleService;
