import mongoose from "mongoose";
let Schema = mongoose.Schema;
const report = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    reportedAt: {
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

const Report = new mongoose.model("reports", report);

export default Report;
