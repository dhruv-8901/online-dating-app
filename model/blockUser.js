import mongoose from "mongoose";
let Schema = mongoose.Schema;
const blockUser = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    blockedAt: {
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

const BlockUser = new mongoose.model("block_users", blockUser);

export default BlockUser;
