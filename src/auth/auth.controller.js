import GetUserResource from "../user/resource/get-user.resource";
import UserService from "../user/user.service";
import authService from "./auth.service";
const expiresInSeconds = 31536000;

class AuthController {
  /**
   * User login
   * @param {*} req
   * @param {*} res
   */
  static async loginUser(req, res) {
    await authService.loginUser(req.body);

    return res.send({
      message: "Verification code is sent to you phone number.",
    });
  }

  /**
   * User Registration
   * @param {*} req
   * @param {*} res
   */
  static async registerUser(req, res) {
    await authService.registerUser(req.body);

    return res.send({
      message: "Verification code is sent to your phone number.",
    });
  }

  /**
   * Refresh token
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async refreshToken(req, res) {
    const data = await authService.refreshToken(req.body);

    return res.send({
      data: {
        auth: {
          tokenType: "Bearer",
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: expiresInSeconds,
        },
      },
    });
  }

  /**
   * Add email
   * @param {*} req
   * @param {*} res
   */
  static async addEmail(req, res) {
    await authService.addEmail(req.body.email, req.user);

    return res.send({
      message: "Verification code is sent to your email.",
    });
  }

  /**
   * Edit email
   * @param {*} req
   * @param {*} res
   */
  static async editEmail(req, res) {
    await authService.editEmail(req.body.email, req.user);

    return res.send({
      message:
        "Email is updated and verification code is sent to your new updated email.",
    });
  }

  /**
   * User OTP verifcation
   * @param {*} req
   * @param {*} res
   */
  static async userOtpVerification(req, res) {
    const userData = await authService.userOtpVerification(req.body);

    return res.send({
      data: {
        ...new GetUserResource(userData),
        auth: {
          tokenType: "Bearer",
          accessToken: userData.tokens.accessToken,
          refreshToken: userData.tokens.refreshToken,
          expiresIn: expiresInSeconds,
        },
      },
    });
  }

  /**
   * Resend OTP
   * @param {*} req
   * @param {*} res
   */
  static async resendOtp(req, res) {
    await authService.resendOtp(req.body);

    return res.send({ message: "Resend OTP successfully!" });
  }

  /**
   * Auth logout
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async logoutUser(req, res) {
    await UserService.userLogout(req.user, req.body.deviceId);

    return res.send({ message: "User logged out successfully" });
  }

  /**
   * Delete by phone
   * @param {*} req
   * @param {*} res
   */
  static async deleteByPhone(req, res) {
    await authService.deleteByPhone(req.body);

    return res.send({ message: "User deleted successfully" });
  }
}

export default AuthController;
