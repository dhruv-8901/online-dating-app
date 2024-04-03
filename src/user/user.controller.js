import GetUserResource from "./resource/get-user.resource";
import UserServices from "./user.service";

class UserController {
  /**
   * Update user data
   * @param {*} req
   * @param {*} res
   */
  static async updateUserData(req, res) {
    const data = await UserServices.updateUserData(
      req.body,
      req.files,
      req.user
    );

    return res.send({ data: new GetUserResource(data) });
  }

  /**
   * Get user data
   * @param {*} req
   * @param {*} res
   */
  static async getUserData(req, res) {
    const data = await UserServices.getUserData(req.user);

    return res.send({ data: new GetUserResource(data) });
  }

  /**
   * delete photo by id
   * @param {*} req
   * @param {*} res
   */
  static async deletePhotoById(req, res) {
    await UserServices.deletePhotoById(req.params.photoId, req.user);

    return res.send({ message: "Photo deleted successfully" });
  }

  /**
   * User account action
   * @param {*} req
   * @param {*} res
   */
  static async userAccountAction(req, res) {
    await UserServices.userAccountAction(req, res);
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  static async getTabBarData(req, res) {
    const data = await UserServices.getTabBarData(req.user);
    return res.send({ data });
  }
}

export default UserController;
