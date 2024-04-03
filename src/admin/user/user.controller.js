import SwipeLimit from "../../../model/swipeLimit";
import User from "../../../model/user";
import { baseUrl } from "../../common/config/constant.config";
import GetUserDateHistoryListResources from "./resources/get-user-date-history";
import UserService from "./user.service";

class UserController {
  /**
   * Get user page
   * @param {*} req
   * @param {*} res
   */
  static async getUserPage(req, res) {
    return res.render("admin/user", { page: "users" });
  }

  /**
   * Get pending user page
   * @param {*} req
   * @param {*} res
   */
  static async getPendingUserPage(req, res) {
    return res.render("admin/pendingUsers", { page: "users" });
  }

  /**
   * get all user data
   * @param {*} req
   * @param {*} res
   */
  static async getAllUsersData(req, res) {
    const { data, filterData } = await UserService.getAllUsersData(
      req.query,
      req.params.status
    );

    const response = {
      draw: req.query.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data: filterData,
    };

    return res.json(response);
  }

  /**
   * Get user dates history from userId page
   * @param {*} req
   * @param {*} res
   */
  static async getUserDatesHistoryFromUserIdPage(req, res) {
    return res.render("admin/date/dateHistory", { page: "users" });
  }

  /**
   * Get user dates history from userId
   * @param {*} req
   * @param {*} res
   */
  static async getUserDatesHistoryFromUserId(req, res) {
    const { data, filterData } =
      await UserService.getUserDatesHistoryFromUserId(
        req.params.userId,
        req.query
      );

    const response = {
      draw: req.query.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data: new GetUserDateHistoryListResources(filterData),
    };

    return res.json(response);
  }

  /**
   * block unblock user from userId
   * @param {*} req
   * @param {*} res
   */
  static async blockUnblockUserFromId(req, res) {
    await UserService.blockUnblockUserFromId(
      req.body.status,
      req.params.userId
    );

    return res.send(
      `User ${req.body.status == 0 ? "unblocked" : "blocked"} successfully.`
    );
  }

  /**
   * Approve or reject user from userId
   * @param {*} req
   * @param {*} res
   */
  static async approveRejectUserFromId(req, res) {
    await UserService.approveRejectUserFromId(
      req.body.status,
      req.params.userId
    );

    return res.send(
      `User ${req.body.status == 1 ? "approved" : "rejected"} successfully.`
    );
  }

  /**
   * Get swipe limit page
   * @param {*} req
   * @param {*} res
   */
  static async getSwipeLimitPage(req, res) {
    const swipeLimit = await SwipeLimit.findOne();
    return res.render("admin/swipesLimit", {
      page: "Swipes limit",
      limit: swipeLimit.limit,
    });
  }

  /**
   * Set swipe limit
   * @param {*} req
   * @param {*} res
   */
  static async setSwipeLimit(req, res) {
    await SwipeLimit.updateOne(
      { _id: { $ne: null } },
      { limit: req.body.limit }
    );
    return res.redirect(baseUrl("admin/user/swipe-limit"));
  }
}

export default UserController;
