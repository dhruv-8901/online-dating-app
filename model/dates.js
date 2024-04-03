import mongoose from "mongoose";
let Schema = mongoose.Schema;
const date = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    peopleId: { type: Schema.Types.ObjectId, ref: "users" },
    rescheduleBy: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    cancelledAt: {
      type: Date,
      required: false,
      default: null,
    },
    status: {
      type: Number,
      required: false,
      default: 1,
    },
    venueId: { type: Schema.Types.ObjectId, ref: "venues" },
    dateAndTime: {
      type: Date,
      required: false,
      default: null,
    },
    suggestionIdeaPopup: {
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

const Dates = new mongoose.model("dates", date);

export default Dates;
