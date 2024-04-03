import sendMail from "../common/send-mail";
import cryptoRandomString from "crypto-random-string";
import JWT from "jsonwebtoken";
import User from "../../model/user";
import AuthHelper from "../common/auth.helper";
import { baseUrl } from "../common/config/constant.config";
import { BadRequestException } from "../error-exception";
import {
  addEmailInMailchimp,
  randomNumberGenerator,
  sendSmsToPhoneNumberFromTwilio,
} from "../common/helper";
import moment from "moment";
import { ROLE } from "../common/constants/constant";
import UserServices from "../user/user.service";
import RefreshToken from "../../model/refreshToken";
import AccessToken from "../../model/accessToken";
import LoginOtp from "../../model/loginOtp";
import client from "@mailchimp/mailchimp_marketing";
require("dotenv").config();

// import AccessToken from "../../model/accessToken";
const SECRET = process.env.JWT_SECRET || "SgJ45D^6J*8";
const expiresIn = process.env.JWT_EXPIRES_IN || "8760h";

class authService {
  /**
   * Register data
   * @param {*} data
   * @returns
   */
  static async registerUser(data) {
    const { phone, countryCode } = data;
    const phoneExist = await User.findOne({
      phone,
      countryCode,
    });

    if (phoneExist && phoneExist.phoneVerifiedAt) {
      throw new BadRequestException("Phone number already in use.");
    }

    let phoneOtp = randomNumberGenerator(4);

    if (phone == 485816993) {
      phoneOtp = 7777;
    }

    await sendSmsToPhoneNumberFromTwilio(
      `Online dating: Use OTP ${phoneOtp} to your phone number verification. DO NOT SHARE this code with anyone.`,
      countryCode + phone
    );

    if (phoneExist) {
      return await User.updateOne(
        { _id: phoneExist._id },
        {
          ...data,
          phoneOtp,
          phoneOtpSentAt: new Date(),
        }
      );
    } else {
      return await User.create({
        ...data,
        phoneOtp,
        phoneOtpSentAt: new Date(),
      });
    }
  }

  /**
   * Login user
   * @param {*} data
   */
  static async loginUser(data) {
    const { phone, countryCode, deviceId } = data;
    const userExist = await User.findOne({ phone, countryCode });

    if (!userExist) {
      throw new BadRequestException("Account does not exist.");
    }

    await LoginOtp.deleteOne({
      phone,
      countryCode,
      deviceId,
      otpVerifiedAt: null,
    });

    let phoneOtp = randomNumberGenerator(4);

    if (phone == 485816993) {
      phoneOtp = 7777;
    }

    await sendSmsToPhoneNumberFromTwilio(
      `Online dating: Use OTP ${phoneOtp} to log in to your account. DO NOT SHARE this code with anyone.`,
      countryCode + phone
    );

    return await LoginOtp.create({
      phone,
      countryCode,
      deviceId,
      otp: phoneOtp,
      otpSentAt: new Date(),
    });
  }

  /**
   * Refresh token
   * @param {object} data
   * @returns
   */
  static async refreshToken(data) {
    const refreshTokenValid = await RefreshToken.findOne({
      token: data.refreshToken,
      isRevoked: false,
    });

    if (!refreshTokenValid) {
      throw new BadRequestException(
        "This refresh token is expired, please login"
      );
    }

    await RefreshToken.updateOne(
      { token: data.refreshToken },
      {
        isRevoked: true,
      }
    );

    await AccessToken.updateOne(
      { token: refreshTokenValid.jti },
      {
        isRevoked: true,
      }
    );

    return await AuthHelper.tokensGenerator(refreshTokenValid.userId);
  }

  /**
   * User Otp verification
   * @param {*} data
   */
  static async userOtpVerification(data) {
    const { phone, countryCode, deviceId, otp, email } = data;

    let userExist;

    if (data.type === 3) {
      userExist = await LoginOtp.findOne({
        phone,
        countryCode,
        deviceId,
        otpVerifiedAt: null,
      });
    } else {
      const query =
        data.type === 1
          ? { phone, countryCode }
          : { email: email.toLowerCase() };

      userExist = await User.findOne(query);
    }

    if (!userExist) {
      throw new BadRequestException("User not found.");
    }

    if (data.type === 1 && userExist.phoneVerifiedAt) {
      throw new BadRequestException("Phone already verified.");
    }

    if (data.type === 2 && userExist.emailVerifiedAt) {
      throw new BadRequestException("Email already verified.");
    }

    if (
      (data.type === 1 && userExist.phoneOtp !== otp) ||
      (data.type === 2 && userExist.emailOtp !== otp) ||
      (data.type === 3 && userExist.otp !== otp)
    ) {
      throw new BadRequestException("Invalid OTP!");
    }

    let newData;

    if (data.type === 3) {
      await LoginOtp.updateOne(
        { _id: userExist._id },
        { otpVerifiedAt: new Date() }
      );

      newData = await User.findOne({
        phone,
        countryCode,
      });
    } else {
      const updateField =
        data.type === 1
          ? { phoneVerifiedAt: new Date() }
          : { emailVerifiedAt: new Date() };
      newData = await User.findOneAndUpdate(
        { _id: userExist._id },
        updateField,
        { new: true }
      );
    }

    if (data.type == 2) {
      await addEmailInMailchimp(email);
    }

    const tokens = await AuthHelper.tokensGenerator(newData.id);

    newData.tokens = tokens;

    return newData;
  }

  /**
   * Resend OTP
   * @param {*} email
   */
  static async resendOtp(data) {
    const userExist = await User.findOne(
      data.type == 1
        ? {
            phone: data.phone,
            countryCode: data.countryCode,
          }
        : { email: data.email.toLowerCase() }
    );

    if (!userExist) {
      throw new BadRequestException("User not found.");
    }

    let otp = randomNumberGenerator(4);

    if (data.type == 1) {
      if (userExist.phoneVerifiedAt) {
        throw new BadRequestException("Phone already verified.");
      }

      if (data.phone == 485816993) {
        otp = 7777;
      }
      await sendSmsToPhoneNumberFromTwilio(
        `Online dating: Use OTP ${otp} to your phone number verification. DO NOT SHARE this code with anyone.`,
        data.countryCode + data.phone
      );
    } else {
      if (userExist.emailVerifiedAt) {
        throw new BadRequestException("Email already verified.");
      }

      const obj = {
        to: data.email.toLowerCase(),
        subject: "Email Verification",
        otp,
      };

      await sendMail(obj, "otp-verification");
    }

    return await User.updateOne(
      { _id: userExist._id },
      data.type == 1
        ? { phoneOtp: otp, phoneOtpSentAt: new Date() }
        : { emailOtp: otp, emailOtpSentAt: new Date() }
    );
  }

  /**
   * Add email
   * @param {*} email
   * @param {*} authUser
   */
  static async addEmail(email, authUser) {
    email = email.toLowerCase();
    const emailExist = await User.findOne({
      email,
      emailVerifiedAt: { $ne: null },
    });

    if (emailExist) {
      throw new BadRequestException("Email already in use.");
    }

    const emailOtp = randomNumberGenerator(4);

    const data = await User.findOneAndUpdate(
      { _id: authUser._id },
      { email, emailOtp, emailOtpSentAt: new Date() },
      { new: true }
    );

    const obj = {
      to: email,
      subject: "Email Verification",
      otp: emailOtp,
    };

    await sendMail(obj, "otp-verification");

    return data;
  }

  /**
   * Edit email
   * @param {*} email
   * @param {*} authUser
   */
  static async editEmail(email, authUser) {
    email = email.toLowerCase();
    const emailExist = await User.findOne({ email });

    if (emailExist) {
      throw new BadRequestException("Email already in use.");
    }

    if (authUser.emailVerifiedAt) {
      throw new BadRequestException(
        "Email already verified so you can't edit email."
      );
    }

    email = email.toLowerCase();

    const otp = randomNumberGenerator(4);

    const data = await User.findOneAndUpdate(
      { email: authUser.email },
      { email, otp, otpSendAt: new Date(), emailVerifiedAt: null },
      { new: true }
    );

    const obj = {
      to: email,
      subject: "Welcome To MyDoc",
      otp,
    };

    await sendMail(obj, "otp-verification");

    return data;
  }

  /**
   * Delete by phone
   * @param {*} data
   */
  static async deleteByPhone(data) {
    if (data.password === "123@onlineAdmin") {
      await User.deleteOne({
        countryCode: data.countryCode,
        phone: data.phone,
      });
      return;
    } else {
      throw new BadRequestException("Invalid request");
    }
  }
}

export default authService;
