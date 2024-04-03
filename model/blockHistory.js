import mongoose from "mongoose";
let Schema = mongoose.Schema;
const blockHistory = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    type: {
      type: Number,
      required: false,
      default : 1
    },
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

const BlockHistory = new mongoose.model("block_histories", blockHistory);

export default BlockHistory;
