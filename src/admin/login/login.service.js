import cryptoRandomString from "crypto-random-string";
import Admin from "../../../model/admin";
import AuthHelper from "../../common/auth.helper";
import { BadRequestException } from "../../error-exception";

class LoginService {
  /**
   * Admin login
   * @param {*} data
   */
  static async adminlogin(data, req) {
    const { email, password } = data;
    const adminExist = await Admin.findOne({ email: email.toLowerCase() });
    if (!adminExist) throw new BadRequestException("Invalid credentials!");
    const passMatch = await AuthHelper.matchHashedPassword(
      password,
      adminExist.password
    );
    if (!passMatch) throw new BadRequestException("Invalid credentials!");
    const token = await AuthHelper.accessTokenGenerator(
      adminExist._id,
      cryptoRandomString({
        length: 50,
        characters: "abcdefg1234567890",
      })
    );

    req.session.token = token;
    return;
  }
}

export default LoginService;
