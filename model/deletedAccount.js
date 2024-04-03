import mongoose from "mongoose";
let Schema = mongoose.Schema;
const deletedAccount = new Schema(
  {
    countryCode: {
      type: String,
      required: false,
      default: null,
    },
    phone: {
      type: Number,
      required: false,
      default: null,
    },
    email: {
      type: String,
      required: false,
    },
    name: {
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

const DeletedAccount = new mongoose.model("deleted_accounts", deletedAccount);

export default DeletedAccount;
