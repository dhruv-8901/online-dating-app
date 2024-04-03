import mongoose from "mongoose";
let Schema = mongoose.Schema;
const swipeLimit = new Schema(
  {
    limit: {
      type: Number,
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

const SwipeLimit = new mongoose.model("swipe_limits", swipeLimit);

export default SwipeLimit;
