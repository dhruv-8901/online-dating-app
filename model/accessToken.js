import mongoose from "mongoose";
let Schema = mongoose.Schema;
const accessToken = new Schema(
  {
    token: {
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
    expiresAt: {
      type: Date,
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

const AccessToken = new mongoose.model("access_tokens", accessToken);

export default AccessToken;
