import mongoose from "mongoose";
let Schema = mongoose.Schema;
const fcmToken = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    token: {
      type: String,
      required: false,
    },
    deviceId: {
      type: String,
      required: false,
    },
    platform: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const FcmToken = new mongoose.model("fcm_tokens", fcmToken);

export default FcmToken;
