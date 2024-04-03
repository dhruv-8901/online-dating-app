import bcrypt from "bcrypt";
import moment from "moment";
import jwt from "jsonwebtoken";
import { JWT, BCRYPT } from "./constants/constant";
import { BadRequestException } from "../error-exception";
import AccessToken from "../../model/accessToken";
import cryptoRandomString from "crypto-random-string";
import RefreshToken from "../../model/refreshToken";
import crypto from "crypto";
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
require("dotenv").config();
const Hours = 8760;
const saltRounds = 10;

class AuthHelper {
  static async matchHashedPassword(password, userPassword) {
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.compare(password, userPassword, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
    return hashedPassword;
  }

  /**
   * Generate bcrypt Password
   *
   * @param String password
   * @return Response
   */
  static async bcryptPassword(password) {
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, BCRYPT.SALT_ROUND, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
    return hashedPassword;
  }

  /**
   * JWT access token generator
   * @param {*} data
   * @returns
   */
  static async accessTokenGenerator(userId, jti) {
    await this.storeAccessToken(userId, jti);

    return await jwt.sign(
      {
        id: userId,
        jti,
      },
      JWT.SECRET,
      { expiresIn: JWT.EXPIRES_IN }
    );
  }

  /**
   * Refresh token generator
   * @param {*} data
   * @returns
   */
  static async refreshTokenGenerator(userId, jti) {
    const cryptoString = cryptoRandomString({
      length: 100,
      characters: "abcdefg1234567890",
    });

    await this.storeRefreshToken(userId, cryptoString, jti);

    return cryptoString;
  }

  /**
   * JWT token generator
   * @param {*} data
   * @returns
   */
  static async tokensGenerator(userId) {
    const cryptoString = cryptoRandomString({
      length: 40,
      characters: "abcdefg1234567890",
    });
    const accessToken = await this.accessTokenGenerator(userId, cryptoString);
    const refreshToken = await this.refreshTokenGenerator(userId, cryptoString);

    return { accessToken, refreshToken };
  }

  /**
   * Get data from jwt token
   * @param {*} token
   * @returns
   */
  static async getDataFromToken(token) {
    return jwt.verify(token, JWT.SECRET);
  }

  /**
   * Store access token to database
   *
   * @param Object user
   * @param String cryptoString
   * @return Response
   */
  static async storeAccessToken(userId, cryptoString) {
    const expiredAt = moment(new Date())
      .utc()
      .add(Hours, "hours")
      .format("YYYY-MM-DD hh:mm:ss");

    await AccessToken.create({
      token: cryptoString,
      userId,
      expires_at: expiredAt,
    });

    return true;
  }

  /**
   * Store refresh token to database
   *
   * @param Object user
   * @param String cryptoString
   * @return Response
   */
  static async storeRefreshToken(userId, cryptoString, jti) {
    const expiredAt = moment(new Date())
      .utc()
      .add(Hours, "hours")
      .format("YYYY-MM-DD hh:mm:ss");

    await RefreshToken.create({
      token: cryptoString,
      jti,
      userId,
      expires_at: expiredAt,
    });

    return true;
  }
}

export default AuthHelper;
