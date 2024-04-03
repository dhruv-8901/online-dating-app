import mongoose from "mongoose";
let Schema = mongoose.Schema;
const match = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    peopleId: { type: Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Match = new mongoose.model("matches", match);

export default Match;
