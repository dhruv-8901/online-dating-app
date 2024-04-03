import mongoose from "mongoose";
import { seeder } from "../seeder";

require("dotenv").config();

exports.mongoConnection = () => {
  try {
    mongoose.set("strictQuery", false);
    // mongoose.set("debug", true); //for query logging
    mongoose
      .connect(process.env.DB_MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        seeder();
        console.log("MongoDB database connection successfull");
      })
      .catch((err) => {
        console.log("MongoDB Database Connection Error", err);
      });
  } catch (e) {
    console.log("MongoDB Connection Error");
  }
};
