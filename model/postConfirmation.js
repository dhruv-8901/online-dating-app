import mongoose from "mongoose";
let Schema = mongoose.Schema;
const postConfirmation = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    dateId: { type: Schema.Types.ObjectId, ref: "dates" },
    notShownBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    isMeet: {
      type: Number,
      required: false,
      default: 1,
    },
    type: {
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

const PostConfirmation = new mongoose.model(
  "post_confirmations",
  postConfirmation
);

export default PostConfirmation;
