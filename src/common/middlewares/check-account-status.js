import { BadRequestException } from "../../error-exception";
import { ACCOUNT_STATUS } from "../constants/constant";

export default async function checkAccountIsActivated(req, res, next) {
  if (req.user.accountStatus == ACCOUNT_STATUS.PAUSE) {
    throw new BadRequestException(
      "You can't access it,active your account first."
    );
  }
  next();
}
