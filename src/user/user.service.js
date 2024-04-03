import User from "../../model/user";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { BadRequestException } from "../error-exception";
import {
  randomNumberGenerator,
  sendNotificationToSingleUser,
  sendSmsToPhoneNumberFromTwilio,
  unlinkFile,
} from "../common/helper";
import AccessToken from "../../model/accessToken";
import FcmToken from "../../model/fcmToken";
import moment from "moment";
import sendMail from "../common/send-mail";
import {
  ACCOUNT_STATUS,
  DATE_IDEA_STATUS,
  GENDER,
  PEOPLE,
} from "../common/constants/constant";
import DeletedAccount from "../../model/deletedAccount";
import PeopleReaction from "../../model/peopleReaction";
import Dates from "../../model/dates";

class UserServices {
  /**
   * Update user data
   * @param {*} data
   * @param {*} photos
   */
  static async updateUserData(data, photos, authUser) {
    if (data.birthDate) {
      const birthdate = moment(+data.birthDate);
      const today = moment();
      const age = today.diff(birthdate, "years");

      if (age < 18) {
        throw new BadRequestException("Your age should be 18+.");
      }
    }

    if (data.daysToMeet) {
      data.daysToMeet = this.processArrayField(data, "daysToMeet");
    }

    if (data.gender) {
      data.gender = this.processArrayField(data, "gender");
    }
    if (data.likeToDate) {
      data.likeToDate = this.processArrayField(data, "likeToDate");
    }

    if (data.gender && data.gender.length) {
      if (this.checkArrayValueExists(data.gender, [GENDER.MAN, GENDER.WOMAN])) {
        throw new BadRequestException("Invalid gender combination");
      }
    }
    if (data.likeToDate && data.likeToDate.length) {
      if (
        this.checkArrayValueExists(data.likeToDate, [GENDER.MAN, GENDER.WOMAN])
      ) {
        throw new BadRequestException(
          "Invalid like to date gender combination"
        );
      }
    }

    if (data.status == 9 && !Array.isArray(data.daysToMeet)) {
      throw new BadRequestException("Days To Meet must be an array");
    }

    if (data.status == 8) {
      if (!photos || photos.length == 0)
        throw new BadRequestException("Photos is required");
    }

    if (photos && photos.length > 0) {
      await User.updateOne(
        { _id: authUser._id },
        {
          $push: {
            photos: {
              $each: photos.map((value) => {
                return { image: value.destination + "/" + value.filename };
              }),
            },
          },
        }
      );

      const userData = await User.findOne({ _id: authUser._id });

      await User.updateOne(
        { _id: authUser._id },
        {
          profileImage: userData.photos[0].image,
        }
      );
    }
    if (data.countryCode && data.phone) {
      if (
        data.countryCode !== authUser.countryCode ||
        data.phone !== authUser.phone
      ) {
        if (
          await User.findOne({
            countryCode: data.countryCode,
            phone: data.phone,
          })
        ) {
          throw new BadRequestException("Phone number already in use.");
        }
        const phoneOtp = randomNumberGenerator(4);

        data.phoneOtp = phoneOtp;
        data.phoneVerifiedAt = null;
        data.phoneOtpSentAt = new Date();

        await sendSmsToPhoneNumberFromTwilio(
          `Online dating: Use OTP ${phoneOtp} to your phone number verification. DO NOT SHARE this code with anyone.`,
          data.countryCode + data.phone
        );
      }
    }

    if (data.email && data.email.toLowerCase() !== authUser.email) {
      if (
        await User.findOne({
          email: data.email.toLowerCase(),
        })
      ) {
        throw new BadRequestException("Email already in use.");
      }
      const emailOtp = randomNumberGenerator(4);

      data.emailVerifiedAt = null;
      data.emailOtp = emailOtp;
      data.emailOtpSentAt = new Date();

      const obj = {
        to: data.email.toLowerCase(),
        subject: "Email Verification",
        otp: emailOtp,
      };

      await sendMail(obj, "otp-verification");
    }

    return await User.findOneAndUpdate(
      { _id: authUser._id },
      {
        ...data,
        status: authUser.isProfileCompleted ? 10 : data.status,
        isProfileCompleted:
          data.status == 10 ? true : authUser.isProfileCompleted,
      },
      { new: true }
    );
  }

  /**
   * Get user data
   * @param {*} authUser
   */
  static async getUserData(authUser) {
    return await User.findOne({ _id: authUser._id });
  }

  /**
   * Delete photo by id
   * @param {*} photoId
   * @param {*} authUser
   */
  static async deletePhotoById(photoId, authUser) {
    const deletePhotoData = await User.aggregate([
      {
        $match: {
          _id: ObjectId(authUser._id),
        },
      },
      {
        $project: {
          deletedPhotos: {
            $filter: {
              input: "$photos",
              as: "photo",
              cond: {
                $eq: ["$$photo._id", ObjectId(photoId)],
              },
            },
          },
        },
      },
    ]);

    if (!deletePhotoData || deletePhotoData[0].deletedPhotos.length == 0) {
      return await User.findOne({ _id: authUser._id });
    }

    deletePhotoData[0].deletedPhotos.map((value) => {
      unlinkFile(value.image);
    });

    await User.findOneAndUpdate(
      { _id: authUser._id },
      {
        $pull: {
          photos: {
            _id: ObjectId(photoId),
          },
        },
      },
      { new: true }
    );

    const userData = await User.findOne({ _id: authUser._id });

    return await User.findOneAndUpdate(
      { _id: authUser._id },
      {
        profileImage: userData.photos[0].image,
      },
      { new: true }
    );
  }

  /**
   * User logout
   * @param {*} authUser
   * @param {*} deviceId
   */
  static async userLogout(authUser, deviceId) {
    await AccessToken.updateOne({ token: authUser.jti }, { isRevoked: true });

    if (deviceId) {
      await FcmToken.deleteOne({ deviceId });
    }

    return;
  }

  /**
   * User account action
   * @param {*} req
   * @param {*} res
   */
  static async userAccountAction(req, res) {
    const type = req.body.type;
    if (type == ACCOUNT_STATUS.PAUSE) {
      await User.updateOne(
        {
          _id: req.user._id,
        },
        {
          accountStatus: 1,
        }
      );

      return res.send({ message: "Your account has been paused" });
    } else if (type == ACCOUNT_STATUS.DELETED) {
      await User.deleteOne({
        _id: req.user._id,
      });

      await DeletedAccount.create({
        countryCode: req.user.countryCode,
        phone: req.user.phone,
        email: req.user.email,
        name: req.user.name,
      });

      return res.send({ message: "Your account has been deleted" });
    } else {
      await User.updateOne(
        {
          _id: req.user._id,
        },
        {
          accountStatus: ACCOUNT_STATUS.ACTIVE,
        }
      );
      return res.send({ message: "Your account has been now activated" });
    }
  }

  /**
   * Get tab bar data
   * @param {*} authUser
   */
  static async getTabBarData(authUser) {
    const peopleLikedYou = await PeopleReaction.aggregate([
      {
        $match: {
          peopleId: ObjectId(authUser._id),
          type: PEOPLE.LIKE,
        },
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
    ]);

    const dateData = await Dates.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { userId: ObjectId(authUser._id) },
                { peopleId: ObjectId(authUser._id) },
              ],
            },
            {
              $or: [
                {
                  status: {
                    $in: [
                      DATE_IDEA_STATUS.RESCHEDULE,
                      DATE_IDEA_STATUS.SENT,
                      DATE_IDEA_STATUS.SUGGESTION,
                    ],
                  },
                },
                {
                  status: DATE_IDEA_STATUS.CANCEL,
                  cancelledAt: {
                    $gte: new Date(moment().subtract(30, "d").startOf("D")),
                  },
                  suggestionIdeaPopup: true,
                },
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          actionRequired: {
            $cond: {
              if: {
                $or: [
                  {
                    $and: [
                      { $eq: ["$status", DATE_IDEA_STATUS.RESCHEDULE] },
                      { $ne: ["$rescheduleBy", ObjectId(authUser._id)] },
                    ],
                  },
                  {
                    $and: [
                      { $eq: ["$status", DATE_IDEA_STATUS.SENT] },
                      { $eq: ["$peopleId", ObjectId(authUser._id)] },
                    ],
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          $or: [
            {
              status: {
                $in: [DATE_IDEA_STATUS.SUGGESTION, DATE_IDEA_STATUS.CANCEL],
              },
            },
            { actionRequired: true },
          ],
        },
      },
    ]);

    const chatData = await Dates.aggregate([
      [
        {
          $match: {
            $and: [
              {
                $or: [
                  { userId: ObjectId(authUser._id) },
                  { peopleId: ObjectId(authUser._id) },
                ],
              },
              {
                $or: [
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
                  },
                  {
                    status: {
                      $in: [
                        DATE_IDEA_STATUS.CONFIRM,
                        DATE_IDEA_STATUS.CANCEL,
                        DATE_IDEA_STATUS.COMPLETED,
                      ],
                    },
                  },
                ],
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
            let: {
              partnerId: "$partnerId",
              authUserId: ObjectId(authUser._id),
            },
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
                $group: {
                  _id: "$_id",
                  unseenCount: { $sum: "$unseen" },
                },
              },
            ],
            as: "chat",
          },
        },
        {
          $match: {
            $or: [{ "chat.unseenCount": { $gt: 0 } }, { chat: { $eq: [] } }],
          },
        },
      ],
    ]);

    return {
      likeTabCount: peopleLikedYou.length,
      dateTabCount: dateData.length,
      chatTabCount: chatData.length,
    };
  }

  /**
   * Process array field
   * @param {*} data
   * @param {*} fieldName
   * @returns
   */
  static processArrayField(data, fieldName) {
    if (data[fieldName] && !Array.isArray(data[fieldName])) {
      data[fieldName] = data[fieldName].split(",").map(Number);
    }
    return data[fieldName];
  }

  /**
   *  Check array value exists
   * @param {*} array
   * @param {*} needToCheckArray
   * @returns
   */
  static checkArrayValueExists(array, needToCheckArray) {
    const hasAllValues = needToCheckArray.every((value) =>
      array.includes(value)
    );

    return hasAllValues;
  }
}

export default UserServices;
