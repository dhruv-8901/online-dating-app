import mongoose from "mongoose";
let Schema = mongoose.Schema;
const loginOtp = new Schema(
  {
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
    deviceId: {
      type: String,
      required: false,
      default: null,
    },
    otp: {
      type: Number,
      required: false,
      default: null,
    },
    otpSentAt: {
      type: Date,
      required: false,
      default: null,
    },
    otpVerifiedAt: {
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

const LoginOtp = new mongoose.model("login_otps", loginOtp);

export default LoginOtp;
