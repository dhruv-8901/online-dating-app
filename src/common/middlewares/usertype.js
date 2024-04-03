import { BadRequestException } from "../../error-exception";

const usertype = (validUserType) => {
  return (req, res, next) => {
    const authUserType = req.user.role;
    if (!validUserType.includes(authUserType)) {
      throw new BadRequestException("You are unable to do this operation.");
    }
    next();
  };
};

export default usertype;
