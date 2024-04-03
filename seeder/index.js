import Admin from "../model/admin";
import SwipeLimit from "../model/swipeLimit";

module.exports.seeder = async () => {
  const admin = await Admin.estimatedDocumentCount();
  if (!admin) {
    await Admin.create({
      email: "admin@onlinedating.com",
      password: "$2a$12$c5/ljF5zA2REZryrTBixpOPSOgnivy3.TYSAXkaHwUVuntW6.M4hK",
    }); //123@onlineAdmin
    console.log("Admin data saved");
  }

  const swipeLimit = await SwipeLimit.estimatedDocumentCount();
  if (!swipeLimit) {
    await SwipeLimit.create({
      limit: 5,
    });
    console.log("Swipe limit saved");
  }
};
