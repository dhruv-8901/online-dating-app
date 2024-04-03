import mongoose from "mongoose";
let Schema = mongoose.Schema;
const refreshToken = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    isRevoked: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const RefreshToken = new mongoose.model("refresh_tokens", refreshToken);

export default RefreshToken;
