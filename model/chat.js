import mongoose from "mongoose";
let Schema = mongoose.Schema;
const chat = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "users" },
    receiverId: { type: Schema.Types.ObjectId, ref: "users" },
    type: {
      type: Number,
      required: false,
      default: 1,
    },
    message: {
      type: String,
      required: false,
      default: null,
    },
    roomId: {
      type: String,
      required: false,
      default: null,
    },
    seenAt: {
      type: Date,
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

const Chat = new mongoose.model("chats", chat);

export default Chat;
