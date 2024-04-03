import admin from "firebase-admin";
import serverKey from "../../online-b8847-firebase-adminsdk-d8ma2-d6a8715329.json";
import { BadRequestException } from "../error-exception";

require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serverKey),
});

export default async (registrationTokens, notificationPayload, dataPayload) => {
  if (registrationTokens.length == 0) {
    return;
  }
  if (!Array.isArray(registrationTokens)) {
    registrationTokens = [registrationTokens];
  }

  if (!notificationPayload) {
    throw new BadRequestException("Notification title and body required.");
  }

  const message = {
    notification: notificationPayload,
    data: dataPayload,
    tokens: registrationTokens,
  };

  admin
    .messaging()
    .sendMulticast(message)
    .then((result) => {
      console.log("Notification sent successfully:", result.responses);
    })
    .catch((error) => {
      console.error("Error in sending notification:", error);
    });
};
