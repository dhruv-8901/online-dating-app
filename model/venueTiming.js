import mongoose from "mongoose";
let Schema = mongoose.Schema;
const venueTiming = new Schema(
  {
    venueId: { type: Schema.Types.ObjectId, ref: "venues" },
    day: {
      type: Number,
      required: false,
      default: null,
    },
    startTime: {
      type: String,
      required: false,
      default: null,
    },
    endTime: {
      type: String,
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

const VenueTiming = new mongoose.model("venue_timing", venueTiming);

export default VenueTiming;
