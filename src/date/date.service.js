import mongoose from "mongoose";
import Dates from "../../model/dates";
import {
  DATE_IDEA_STATUS,
  NOTIFICATION_TYPE,
  PAGINATION,
  PEOPLE,
} from "../common/constants/constant";
import PeopleService from "../people/people.service";
import { BadRequestException } from "../error-exception";
import PeopleReaction from "../../model/peopleReaction";
import { auth } from "firebase-admin";
import Venue from "../../model/venue";
import Match from "../../model/match";
import { sendNotificationToSingleUser } from "../common/helper";
import VenueTiming from "../../model/venueTiming";
import moment from "moment";
import PostConfirmation from "../../model/postConfirmation";
import GetPeopleLikesYouListResources from "../people/resource/get-people-likes-you.resource";
import GetDatesListResources from "./resources/get-dates-list.resource";
import GetSuggestIdeaUserListResources from "../people/resource/get-suggest-idea-user-list.resource";
import BlockUser from "../../model/blockUser";
const ObjectId = mongoose.Types.ObjectId;

class DateServices {
  static async getDateList(
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
    ];

    if (type == 1) {
      pipeline.push({
        $match: {
          status: {
            $in: [DATE_IDEA_STATUS.RESCHEDULE, DATE_IDEA_STATUS.SENT],
          },
        },
      });
    } else if (type == 2) {
      pipeline.push({
        $match: {
          status: DATE_IDEA_STATUS.CONFIRM,
        },
      });
    } else if (type == 3) {
      pipeline.push({
        $match: {
          status: {
            $in: [DATE_IDEA_STATUS.COMPLETED, DATE_IDEA_STATUS.CANCEL],
          },
        },
      });
    } else if (type == 4) {
      pipeline.push({
        $match: {
          $or: [
            {
              status: {
                $in: [
                  DATE_IDEA_STATUS.RESCHEDULE,
                  DATE_IDEA_STATUS.SENT,
                  DATE_IDEA_STATUS.CONFIRM,
                  DATE_IDEA_STATUS.SUGGESTION,
                ],
              },
            },
            {
              status: DATE_IDEA_STATUS.CANCEL,
              cancelledAt: {
                $gte: new Date(moment().subtract(30, "d").startOf("D")),
              },
            },
          ],
        },
      });
    }

    const newData = await Dates.aggregate([
      ...pipeline,
      {
        $sort: { status: -1, created_at: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalData = await Dates.aggregate(pipeline);

    newData.forEach((value) => {
      if (type == 1 || type == 4) {
        if (
          value.status == DATE_IDEA_STATUS.RESCHEDULE &&
          value.rescheduleBy &&
          !value.rescheduleBy.equals(ObjectId(authUser._id))
        ) {
          value.actionRequired = true;
        } else {
          if (
            value.status == DATE_IDEA_STATUS.SENT &&
            value.peopleId.equals(ObjectId(authUser._id))
          ) {
            value.actionRequired = true;
          } else {
            value.actionRequired = false;
          }
        }
      }
    });

    let suggestionIdeas = [];
    let data;
    // if (type == 4 && currentPage == 1) {
    //   const suggestionIdeaList = await Match.aggregate([
    //     {
    //       $match: {
    //         $or: [
    //           {
    //             peopleId: authUser._id,
    //           },
    //           {
    //             userId: authUser._id,
    //           },
    //         ],
    //       },
    //     },
    //     {
    //       $addFields: {
    //         partnerId: {
    //           $cond: {
    //             if: { $eq: ["$peopleId", ObjectId(authUser._id)] },
    //             then: "$userId",
    //             else: "$peopleId",
    //           },
    //         },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "dates",
    //         let: {
    //           partnerId: "$partnerId",
    //           authUserId: ObjectId(authUser._id),
    //         },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $or: [
    //                   {
    //                     $and: [
    //                       { $eq: ["$peopleId", "$$partnerId"] },
    //                       { $eq: ["$userId", "$$authUserId"] },
    //                     ],
    //                   },
    //                   {
    //                     $and: [
    //                       { $eq: ["$userId", "$$partnerId"] },
    //                       { $eq: ["$peopleId", "$$authUserId"] },
    //                     ],
    //                   },
    //                 ],
    //               },
    //             },
    //           },
    //         ],
    //         as: "dateInfo",
    //       },
    //     },
    //     {
    //       $match: {
    //         dateInfo: { $eq: [] },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "users",
    //         localField: "partnerId",
    //         foreignField: "_id",
    //         as: "partnerDetails",
    //       },
    //     },
    //     {
    //       $unwind: "$partnerDetails",
    //     },
    //   ]);

    //   data = {
    //     suggestionIdeas: new GetSuggestIdeaUserListResources(
    //       suggestionIdeaList
    //     ),
    //     opcomingData: new GetDatesListResources(newData),
    //   };
    // }

    return {
      data: data ? data : new GetDatesListResources(newData),
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
   * Get venue list
   */
  static async getVenueList() {
    return await Venue.find();
  }

  /**
   * get available date by venue id
   * @param {*} venueId
   */
  static async getVenueAvailableDateByVenueId(venueId) {
    const venueDateTime = await VenueTiming.find({
      venueId,
    });

    const availableDays = venueDateTime
      .filter((item) => item.startTime !== "" || item.endTime !== "")
      .map((item) => item.day);

    function getAvailableDates(startDate, endDate) {
      const dateArray = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const currentDay = (currentDate.getDay() + 6) % 7;

        if (availableDays.includes(currentDay)) {
          dateArray.push(+moment(currentDate).format("x")); // Format as "YYYY-MM-DD"
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dateArray;
    }

    const availableDateArray = getAvailableDates(
      new Date(moment().add(1, "d")),
      new Date(moment().add(16, "d"))
    );

    return availableDateArray;
  }

  /**
   * Get available time by venue id
   * @param {*} startDate
   * @param {*} endDate
   */
  static async getVenueAvailableTimeByVenueId(venueId, date) {
    const currentDay = (new Date(date).getDay() + 6) % 7;
    const venueTiming = await VenueTiming.findOne({
      venueId,
      day: currentDay,
    });

    if (!venueTiming) {
      return [];
    }

    function getHoursBetween(startTime, endTime) {
      const hours = [];
      let currentHour = startTime;

      while (currentHour < endTime) {
        hours.push(currentHour);
        const [hour, minute] = currentHour.split(":");
        const nextHour = new Date(0, 0, 0, hour, minute);
        nextHour.setHours(nextHour.getHours() + 1);
        currentHour = `${String(nextHour.getHours()).padStart(2, "0")}:${String(
          nextHour.getMinutes()
        ).padStart(2, "0")}`;
      }

      return hours;
    }

    const result = getHoursBetween(venueTiming.startTime, venueTiming.endTime);
    return result;
  }

  /**
   * Give date idea to the poeple who likes you
   * @param {*} peopleId
   * @param {*} authUser
   */
  static async giveDateIdeaToLikedPeople(peopleId, data, authUser) {
    if (!(await Venue.findOne({ _id: data.venueId }))) {
      throw new BadRequestException("Venue not found.");
    }

    if (new Date() > new Date(data.dateAndTime)) {
      throw new BadRequestException("You can't select past date and time.");
    }

    const matchExist = await Match.findOne({
      $or: [
        {
          userId: authUser._id,
          peopleId,
        },
        {
          peopleId: authUser._id,
          userId: peopleId,
        },
      ],
    });

    if (!matchExist) {
      throw new BadRequestException(
        "You can only send date ideas to those who have a match with you"
      );
    }

    return await Dates.create({ ...data, peopleId, userId: authUser._id });
  }

  /**
   * Give date idea to suggested people
   * @param {*} dateId
   * @param {*} data
   * @param {*} authUser
   */
  static async giveDateIdeaToSuggestedPeople(dateId, data, authUser) {
    const dateExist = await Dates.findOne({
      _id: dateId,
      $or: [
        { userId: ObjectId(authUser._id) },
        { peopleId: ObjectId(authUser._id) },
      ],
      suggestionIdeaPopup: true,
      status: {
        $in: [DATE_IDEA_STATUS.SUGGESTION, DATE_IDEA_STATUS.CANCEL],
      },
    });

    if (!dateExist) {
      throw new BadRequestException(
        "Date is not found or not valid for this action."
      );
    }

    if (new Date() > new Date(data.dateAndTime)) {
      throw new BadRequestException("You can't select past date and time.");
    }

    if (!(await Venue.findOne({ _id: data.venueId }))) {
      throw new BadRequestException("Venue not found.");
    }

    let peopleId = dateExist.userId;

    if (dateExist.userId.equals(authUser._id)) {
      peopleId = dateExist.peopleId;
    }

    await Dates.findOneAndUpdate(
      { _id: dateId },
      {
        status: DATE_IDEA_STATUS.SENT,
        suggestionIdeaPopup: false,
        userId: authUser._id,
        peopleId,
        ...data,
      },
      {
        new: true,
      }
    );

    return await sendNotificationToSingleUser(
      peopleId,
      {
        title: `New Date idea from ${authUser.name}.`,
        body: `New Date idea from ${authUser.name}.`,
      },
      {
        userId: authUser._id.toString(),
        dateId: dateId.toString(),
        type: NOTIFICATION_TYPE.DATE,
      }
    );
  }

  /**
   * Confirm or cancel date idea by dateId
   * @param {*} dateId
   * @param {*} data
   * @param {*} authUser
   */
  static async confirmOrCancelDealIdeaByDateId(dateId, type, authUser) {
    const dateExist = await Dates.findOne({
      _id: dateId,
      $or: [
        { userId: ObjectId(authUser._id) },
        { peopleId: ObjectId(authUser._id) },
      ],
      status:
        type == DATE_IDEA_STATUS.CANCEL
          ? DATE_IDEA_STATUS.CONFIRM
          : {
              $in: [DATE_IDEA_STATUS.SENT, DATE_IDEA_STATUS.RESCHEDULE],
            },
    });

    if (!dateExist) {
      throw new BadRequestException(
        "Date is not found or not valid for this action."
      );
    } else {
      if (type == DATE_IDEA_STATUS.CONFIRM) {
        if (
          dateExist.status == DATE_IDEA_STATUS.SENT &&
          !dateExist.peopleId.equals(ObjectId(authUser._id))
        ) {
          throw new BadRequestException("Invalid request!");
        } else if (
          dateExist.status == DATE_IDEA_STATUS.RESCHEDULE &&
          dateExist.rescheduleBy.equals(ObjectId(authUser._id))
        ) {
          throw new BadRequestException("Invalid request!");
        }
      }
    }

    await Dates.findOneAndUpdate(
      { _id: dateId },
      {
        status: type,
        cancelledBy: type == DATE_IDEA_STATUS.CANCEL ? authUser._id : null,
        cancelledAt: type == DATE_IDEA_STATUS.CANCEL ? Date.now() : null,
        suggestionIdeaPopup: type == DATE_IDEA_STATUS.CANCEL ? true : false,
      },
      {
        new: true,
      }
    );

    return await sendNotificationToSingleUser(
      dateExist.userId.equals(ObjectId(authUser._id))
        ? dateExist.peopleId
        : dateExist.userId,
      {
        title:
          type == DATE_IDEA_STATUS.CONFIRM
            ? `You have a date with ${authUser.name}.`
            : `${authUser.name} cancelled your date.`,
        body:
          type == DATE_IDEA_STATUS.CONFIRM
            ? `You have a date with ${authUser.name}.`
            : `${authUser.name} cancelled your date.`,
      },
      {
        userId: authUser._id.toString(),
        dateId: dateId.toString(),
        type: NOTIFICATION_TYPE.DATE,
      }
    );
  }

  /**
   * Post confirmation by dateId
   * @param {*} dateId
   * @param {*} type
   * @param {*} authUser
   */
  static async postConfirmationByDateId(dateId, data, authUser) {
    const dateCompleted = await Dates.aggregate([
      {
        $match: {
          _id: ObjectId(dateId),
          $or: [
            { userId: ObjectId(authUser._id) },
            { peopleId: ObjectId(authUser._id) },
          ],
          status: DATE_IDEA_STATUS.COMPLETED,
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
    ]);

    if (!dateCompleted.length) {
      throw new BadRequestException(
        "Date is not found or not valid for this action"
      );
    }

    if (await PostConfirmation.findOne({ dateId, userId: authUser._id })) {
      throw new BadRequestException("You already posted date confirmation");
    }

    if (data.type) {
      if (data.type !== 3) {
        if (data.type == 1) {
          data.notShownBy = dateCompleted[0].partnerId;
        } else if (data.type == 2) {
          data.notShownBy = authUser._id;
        }
      }
    }

    return await PostConfirmation.create({
      ...data,
      dateId,
      userId: authUser._id,
    });
  }

  /**
   * Pending post confirmation
   * @param {*} authUser
   */
  static async pendingPostConfirmation(authUser) {
    return await Dates.aggregate([
      {
        $match: {
          $or: [
            { userId: ObjectId(authUser._id) },
            { peopleId: ObjectId(authUser._id) },
          ],
          status: DATE_IDEA_STATUS.COMPLETED,
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
          from: "post_confirmations",
          localField: "_id",
          foreignField: "dateId",
          pipeline: [
            {
              $match: {
                userId: ObjectId(authUser._id),
              },
            },
          ],
          as: "postConfirmations",
        },
      },
      {
        $match: {
          postConfirmations: { $size: 0 },
        },
      },
    ]);
  }

  /**
   * Change date idea
   * @param {*} dateId
   * @param {*} data
   * @param {*} authUser
   */
  static async changeDate(dateId, data, authUser) {
    const dateExist = await Dates.findOne({
      _id: dateId,
      $or: [
        { userId: ObjectId(authUser._id) },
        { peopleId: ObjectId(authUser._id) },
      ],
      status: {
        $in: [
          DATE_IDEA_STATUS.SENT,
          DATE_IDEA_STATUS.CONFIRM,
          DATE_IDEA_STATUS.RESCHEDULE,
        ],
      },
    });

    if (!dateExist) {
      throw new BadRequestException(
        "Date is not found or not valid for this action."
      );
    }

    if (dateExist.suggestionIdeaPopup) {
      throw new BadRequestException("Invalid request.");
    }

    if (new Date() > new Date(data.dateAndTime)) {
      throw new BadRequestException("You can't select past date and time.");
    }

    if (data.venueId && !(await Venue.findOne({ _id: data.venueId }))) {
      throw new BadRequestException("Venue not found.");
    }

    const isUserBlocked = await BlockUser.findOne({
      $or: [
        {
          userId: dateExist.userId,
          blockedBy: dateExist.peopleId,
        },
        {
          userId: dateExist.peopleId,
          blockedBy: dateExist.userId,
        },
      ],
    });

    if (isUserBlocked) {
      throw new BadRequestException("You can't change date idea.");
    }

    await Dates.findOneAndUpdate(
      { _id: dateId },
      {
        status: DATE_IDEA_STATUS.RESCHEDULE,
        rescheduleBy: authUser._id,
        ...data,
      },
      {
        new: true,
      }
    );

    return await sendNotificationToSingleUser(
      dateExist.userId.equals(ObjectId(authUser._id))
        ? dateExist.peopleId
        : dateExist.userId,
      {
        title: `New Date idea from ${authUser.name}.`,
        body: `New Date idea from ${authUser.name}.`,
      },
      {
        userId: authUser._id.toString(),
        dateId: dateId.toString(),
        type: NOTIFICATION_TYPE.DATE,
      }
    );
  }

  /**
   * Cancel date idea
   * @param {*} dateId
   * @param {*} authUser
   */
  static async cancelDateIdea(dateId, authUser) {
    const dateExist = await Dates.findOne({
      _id: dateId,
      $or: [
        { userId: ObjectId(authUser._id) },
        { peopleId: ObjectId(authUser._id) },
      ],
      status: {
        $in: [DATE_IDEA_STATUS.SENT, DATE_IDEA_STATUS.RESCHEDULE],
      },
    });

    if (!dateExist || dateExist.suggestionIdeaPopup) {
      throw new BadRequestException("Invalid request.");
    }

    if (
      dateExist.status === DATE_IDEA_STATUS.RESCHEDULE &&
      dateExist.rescheduleBy &&
      !dateExist.rescheduleBy.equals(ObjectId(authUser._id))
    ) {
      throw new BadRequestException("Invalid request.");
    }

    if (
      dateExist.status === DATE_IDEA_STATUS.SENT &&
      dateExist.peopleId.equals(ObjectId(authUser._id))
    ) {
      throw new BadRequestException("Invalid request.");
    }

    const updateData = {
      status: DATE_IDEA_STATUS.SUGGESTION,
      rescheduleBy: null,
      cancelledBy: null,
      dateAndTime: null,
      suggestionIdeaPopup: true,
      venueId: null,
    };

    return await Dates.updateOne({ _id: dateId }, updateData);
  }
}

export default DateServices;
