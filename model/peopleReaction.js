import mongoose from "mongoose";
let Schema = mongoose.Schema;
const peopleReaction = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    peopleId: { type: Schema.Types.ObjectId, ref: "users" },
    type: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const PeopleReaction = new mongoose.model("people_reactions", peopleReaction);

export default PeopleReaction;
