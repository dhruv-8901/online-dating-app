import moment from "moment";
import { BadRequestException } from "../error-exception";
import { baseUrl } from "./config/constant.config";
import path from "path";
import fs from "fs";
import CryptoJS from "crypto-js";
import sendPush from "../traits/send-push";
import FcmToken from "../../model/fcmToken";
import mailchimp from "@mailchimp/mailchimp_marketing";
require("dotenv").config();

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const secretKey = process.env.JWT_SECRET;

/**
 * randomString : generate random string for given length
 * @param {number} length : length of random string to be generated (default 75)
 * @return {number} : generated random string
 */
export const randomStringGenerator = (givenLength = 75) => {
  const characters =
    givenLength > 10
      ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = givenLength;
  let randomStr = "";

  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    randomStr += characters[randomNum];
  }
  return randomStr;
};

/**
 * randomString : generate random string for given length
 * @param {number} length : length of random string to be generated (default 75)
 * @return {number} : generated random string
 */
export const randomNumberGenerator = (givenLength = 4) => {
  const characters = "123456789";
  const length = givenLength;
  let randomStr = "";

  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    randomStr += characters[randomNum];
  }
  return randomStr;
};

/**
 * Convert id of array in to object id of array
 * @param {*} array
 * @returns
 */
export const convertArrayIntoObjectId = (array) => {
  return array
    .filter((value) => ObjectId.isValid(value))
    .map((value) => ObjectId(value));
};

/**
 * App logo
 * @returns
 */
export const logo = () => {
  return baseUrl("icons/logo.png");
};

/**
 * encoded string by crypto
 * @param {*} string
 * @returns
 */
export const encodeString = (string) => {
  const encryptedText = CryptoJS.AES.encrypt(string, secretKey).toString();

  return encryptedText;
};

/**
 * Decode the crypto encrypted string
 * @param {*} string
 * @returns
 */
export const decodeString = (string) => {
  const decryptedText = CryptoJS.AES.decrypt(string, secretKey).toString(
    CryptoJS.enc.Utf8
  );

  return decryptedText;
};

/**
 * Check mongo id is valid or not
 * @param {*} id
 * @returns
 */
export const checkIdIsValid = (id) => {
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException("Invalid Id!");
  }

  return;
};

/**
 * Calculate hour diffrence
 * @param {*} endDateString
 * @param {*} startDateString
 * @returns
 */
export const calculateHourDifference = (endDateString, startDateString) => {
  const startTime = moment(startDateString, "HH:mm");
  const endTime = moment(endDateString, "HH:mm");

  let hourDifference = endTime.isBefore(startTime)
    ? endTime.diff(startTime, "minutes") / 60 + 24
    : endTime.diff(startTime, "minutes") / 60;

  return +hourDifference.toFixed(2);
};

/**
 * Calculate time diffrence
 * @param {*} endTimeString
 * @param {*} startTimeString
 * @returns
 */
export const calculateTimeDifference = (endTimeString, startTimeString) => {
  const startTime = new Date(`1970-01-01T${startTimeString}Z`);
  const endTime = new Date(`1970-01-01T${endTimeString}Z`);

  let timeDifferenceMs;

  if (endTime >= startTime) {
    timeDifferenceMs = endTime - startTime;
  } else {
    // If end time is earlier than start time, assume it's on the next day
    const nextDayEndTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    timeDifferenceMs = nextDayEndTime - startTime;
  }

  const hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
  const minutes = Math.floor(
    (timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((timeDifferenceMs % (1000 * 60)) / 1000);

  const formattedDifference = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return formattedDifference;
};

/**
 * calculate distance
 * @param {*} lat1
 * @param {*} lon1
 * @param {*} lat2
 * @param {*} lon2
 * @returns
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371;

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  const latDiff = lat2Rad - lat1Rad;
  const lonDiff = lon2Rad - lon1Rad;

  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance;
};

/**
 * unlink file from the storage
 * @param {*} filepath
 * @returns
 */
export const unlinkFile = (filepath) => {
  const deletFilePath = path.join(`${__dirname}../../../${filepath}`);
  if (fs.existsSync(deletFilePath)) {
    fs.unlinkSync(deletFilePath);
  }
  return;
};

/**
 * check time is overlapping
 * @param {*} availableHours
 * @returns
 */
export const checkOverlap = (availableHours) => {
  const dayMap = new Map();
  for (const hours of availableHours) {
    for (const day of hours.days) {
      if (dayMap.has(day)) {
        const existingHours = dayMap.get(day);
        for (const existing of existingHours) {
          if (isTimeOverlap(existing.from, existing.to, hours.from, hours.to)) {
            throw new BadRequestException(
              "Overlapping time slots are not allowed on particular day."
            );
          }
        }
        existingHours.push(hours);
      } else {
        dayMap.set(day, [hours]);
      }
    }
  }

  function isTimeOverlap(from1, to1, from2, to2) {
    const startTime1 = new Date(`1970-01-01T${from1}Z`);
    const endTime1 = new Date(`1970-01-01T${to1}Z`);
    const startTime2 = new Date(`1970-01-01T${from2}Z`);
    const endTime2 = new Date(`1970-01-01T${to2}Z`);

    return (
      (startTime1 <= endTime2 && startTime2 <= endTime1) ||
      (endTime1 <= startTime2 && endTime2 <= startTime1)
    );
  }
  return;
};

export const generateTimeSlots = (startTime, endTime, slotDuration) => {
  const slots = [];
  const currentTime = moment(startTime, "HH:mm");
  const endTimeMoment = moment(endTime, "HH:mm");

  while (
    currentTime.isBefore(endTimeMoment) ||
    currentTime.isSame(endTimeMoment)
  ) {
    slots.push(currentTime.format("HH:mm"));
    currentTime.add(slotDuration, "minutes");
  }

  return slots;
};

export const checkTimeSlotIsValidForAvailability = (timeSlots) => {
  const validMinutes = ["00", "15", "30", "45"];

  for (const slot of timeSlots) {
    const [, minutes] = slot.match(/:(\d{2})$/);
    if (!validMinutes.includes(minutes)) {
      return false;
    }
  }

  return true;
};

export const checkTimeSlotIsValid = (slot, startTime, endTime) => {
  const timeSlots = {};

  if (!checkTimeSlotIsValidForAvailability(slot)) {
    return false;
  }
  for (const time of slot) {
    if (time < startTime || time > endTime) {
      return false;
    }

    if (timeSlots[time]) {
      return false;
    }

    timeSlots[time] = true;
  }

  return true;
};

export const checkTimeSlotIsOverLap = (slots) => {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (
        slots[i].startTime < slots[j].endTime &&
        slots[j].startTime < slots[i].endTime
      ) {
        return true;
      }
    }
  }
  return false;
};

export const checkDatesUniqueOrNotPast = (timestamps) => {
  const uniqueDates = new Set();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date();
  futureDate.setHours(0, 0, 0, 0);
  futureDate.setDate(futureDate.getDate() + 30);

  for (const timestamp of timestamps) {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    const dateString = date.toISOString().slice(0, 10);

    if (
      date < today ||
      date > futureDate ||
      uniqueDates.has(date.toDateString())
    ) {
      return false;
    }

    uniqueDates.add(dateString);
  }

  return true;
};

/**
 * Get dates array between two dates
 * @param {*} startDate
 * @param {*} endDate
 */
export const getDatesArrayBetweenTwoDates = (startDate, endDate) => {
  let date = startDate;
  let dates = [];

  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

/**
 * Send sms to the phone number from twilio
 * @param {*} message
 * @param {*} phoneNumber
 */
export const sendSmsToPhoneNumberFromTwilio = async (message, phoneNumber) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  await client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })
    .then((message) => console.log(message.sid));
};

/**
 * Send notification to the single user
 * @param {*} userId
 * @param {*} notificationPayload
 * @param {*} dataPayload
 */
export const sendNotificationToSingleUser = async (
  userId,
  notificationPayload,
  dataPayload
) => {
  const userTokens = await FcmToken.aggregate([
    {
      $match: {
        userId: ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$token",
        tokens: { $push: "$token" },
      },
    },
    {
      $project: {
        _id: 0,
        token: "$_id",
      },
    },
  ]);

  const tokens = userTokens.map((item) => item.token);

  sendPush(tokens, notificationPayload, dataPayload);
};

/**
 * Add email in mailichimp
 * @param {*} email
 * @returns
 */
export const addEmailInMailchimp = async (email) => {
  try {
    const mailchimp = require("@mailchimp/mailchimp_marketing");

    mailchimp.setConfig({
      apiKey: process.env.MAILICHIMP_API_KEY,
      server: process.env.MAILICHIMP_SERVER_PREFIX,
    });

    return await mailchimp.lists.addListMember(process.env.MAILICHIMP_LIST_ID, {
      email_address: email,
      status: "subscribed",
    });
  } catch (error) {
    console.log(error);
  }
};
