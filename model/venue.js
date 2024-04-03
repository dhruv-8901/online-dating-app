import mongoose from "mongoose";
let Schema = mongoose.Schema;
const venue = new Schema(
  {
    venue: {
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

const Venue = new mongoose.model("venues", venue);

export default Venue;
