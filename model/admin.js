import mongoose from "mongoose";
let Schema = mongoose.Schema;
const admin = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    password: {
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

const Admin = new mongoose.model("admins", admin);

export default Admin;
