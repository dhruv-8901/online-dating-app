import moment from "moment";
import User from "../../../model/user";
import { BadRequestException } from "../../error-exception";
import LoginService from "./login.service";
import jwt from "jsonwebtoken";
import { DATE_IDEA_STATUS, JWT } from "../../common/constants/constant";
import { baseUrl } from "../../common/config/constant.config";
import DeletedAccount from "../../../model/deletedAccount";
import Match from "../../../model/match";
import Dates from "../../../model/dates";

class LoginController {
  /**
   * get login page
   * @param {*} req
   * @param {*} res
   */
  static async getLoginPage(req, res) {
    try {
      if (req.session.token) {
        jwt.verify(req.session.token, JWT.SECRET, function (err, decoded) {
          if (err) {
            return res.render("admin/login");
          } else {
            return res.redirect(baseUrl("admin"));
          }
        });
      } else {
        return res.render("admin/login");
      }
    } catch (err) {
      return res.render("admin/login");
    }
  }

  /**
   * Admin login
   * @param {*} req
   * @param {*} res
   */
  static async adminlogin(req, res) {
    await LoginService.adminlogin(req.body, req);

    return res.send({ message: "Login successfully." });
  }

  /**
   * Admin Dashboard
   * @param {*} req
   * @param {*} res
   */
  static async adminDashboard(req, res) {
    const dailyActiveUser = await User.find({
      lastLoginAt: {
        $gte: new Date(moment().startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const monthlyActiveUser = await User.find({
      lastLoginAt: {
        $gte: new Date(moment().subtract(30, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const dailyUnsubscribedUser = await DeletedAccount.find({
      created_at: {
        $gte: new Date(moment().startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const monthlyUnsubscribedUser = await DeletedAccount.find({
      created_at: {
        $gte: new Date(moment().subtract(30, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const dailyNewJoinUser = await User.find({
      created_at: {
        $gte: new Date(moment().startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const monthlyNewJoinUser = await User.find({
      created_at: {
        $gte: new Date(moment().subtract(30, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const weeklyNewMatches = await Match.find({
      created_at: {
        $gte: new Date(moment().subtract(6, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const monthlyNewMatches = await Match.find({
      created_at: {
        $gte: new Date(moment().subtract(30, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    const dailyNewDates = await Dates.find({
      dateAndTime: {
        $gte: new Date(moment().startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
      status: {
        $ne: DATE_IDEA_STATUS.SUGGESTION,
      },
    });

    const weeklyNewDates = await Dates.find({
      dateAndTime: {
        $gte: new Date(moment().subtract(6, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
      status: {
        $ne: DATE_IDEA_STATUS.SUGGESTION,
      },
    });

    const monthlyNewDates = await Dates.find({
      dateAndTime: {
        $gte: new Date(moment().subtract(30, "d").startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
      status: {
        $ne: DATE_IDEA_STATUS.SUGGESTION,
      },
    });

    const dailyNewUser = dailyNewJoinUser.length - dailyUnsubscribedUser.length;
    const monthlyNewUser =
      monthlyNewJoinUser.length - monthlyUnsubscribedUser.length;

    return res.render("admin/", {
      page: "dashboard",
      dailyActiveUser: dailyActiveUser.length,
      monthlyActiveUser: monthlyActiveUser.length,
      dailyUnsubscribedUser: dailyUnsubscribedUser.length,
      monthlyUnsubscribedUser: monthlyUnsubscribedUser.length,
      dailyNewUser: dailyNewUser,
      monthlyNewUser: monthlyNewUser,
      weeklyNewMatches: weeklyNewMatches.length,
      monthlyNewMatches: monthlyNewMatches.length,
      dailyNewDates: dailyNewDates.length,
      weeklyNewDates: weeklyNewDates.length,
      monthlyNewDates: monthlyNewDates.length,
    });
  }

  /**
   * Admin logout
   * @param {*} req
   * @param {*} res
   */
  static async adminLogout(req, res) {
    delete req.session.token;
    return res.redirect(baseUrl("admin/login"));
  }
}

export default LoginController;
