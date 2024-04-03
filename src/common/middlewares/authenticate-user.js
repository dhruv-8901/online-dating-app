// jwt AUTHENTICATION
import moment from "moment";
import AccessToken from "../../../model/accessToken";
import User from "../../../model/user";
import { HttpStatus } from "../../error-exception";
import passport from "passport";

export default (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED_EXCEPTION)
        .send({ message: "Unauthorized" });
    }

    const exist = await AccessToken.findOne({
      token: user.jti,
      isRevoked: false,
      userId: user._id,
    });

    if (!exist) {
      return res
        .status(HttpStatus.UNAUTHORIZED_EXCEPTION)
        .send({ message: "Unauthorized" });
    }

    const lastLogin = await User.findOne({
      _id: user._id,
      lastLoginAt: {
        $gte: new Date(moment().startOf("D")),
        $lt: new Date(moment().add(1, "d").startOf("D")),
      },
    });

    if (!lastLogin) {
      await User.updateOne(
        { _id: user._id },
        {
          lastLoginAt: new Date(),
        }
      );
    }

    req.user = user;

    return next();
  })(req, res, next);
};
