import mongoose from "mongoose";
let Schema = mongoose.Schema;

const photsSchema = new Schema({
  image: {
    type: String,
    required: false,
    default: null,
  },
});

const user = new Schema(
  {
    status: {
      type: Number,
      required: false,
      default: 1,
    },
    countryCode: {
      type: String,
      required: false,
      default: null,
    },
    phone: {
      type: Number,
      required: false,
      default: null,
    },
    email: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    profileImage: {
      type: String,
      required: false,
      default: null,
    },
    birthDate: {
      type: Date,
      required: false,
      default: null,
    },
    hieghtInFeet: {
      type: Number,
      required: false,
      default: null,
    },
    hieghtInInch: {
      type: Number,
      required: false,
      default: null,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    latitude: {
      type: Number,
      required: false,
      default: null,
    },
    longitude: {
      type: Number,
      required: false,
      default: null,
    },
    gender: [
      {
        type: Number,
        required: false,
        default: null,
      },
    ],
    likeToDate: [
      {
        type: Number,
        required: false,
        default: null,
      },
    ], // 1- for man , 2 - woman , 3 - nonbinary
    agePreferenceFrom: {
      type: Number,
      required: false,
      default: null,
    },
    agePreferenceTo: {
      type: Number,
      required: false,
      default: null,
    },
    photos: [
      {
        type: photsSchema,
        required: false,
        default: null,
      },
    ],
    daysToMeet: [
      {
        type: Number,
        required: false,
        default: null,
      },
    ],
    socialLink: {
      type: String,
      required: false,
      default: null,
    },
    userCode: {
      type: String,
      required: false,
      default: null,
    },
    referralCode: {
      type: String,
      required: false,
      default: null,
    },
    phoneOtp: {
      type: Number,
      required: false,
      default: null,
    },
    phoneOtpSentAt: {
      type: Date,
      required: false,
      default: null,
    },
    emailOtp: {
      type: Number,
      required: false,
      default: null,
    },
    emailOtpSentAt: {
      type: Date,
      required: false,
      default: null,
    },
    isProfileCompleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    phoneVerifiedAt: {
      type: Date,
      required: false,
      default: null,
    },
    emailVerifiedAt: {
      type: Date,
      required: false,
      default: null,
    },
    accountStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    isBlocked: {
      type: Number,
      required: false,
      default: false,
    },
    approvedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = new mongoose.model("users", user);

export default User;
