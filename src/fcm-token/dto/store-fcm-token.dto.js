import Joi from "joi";
import { PLATFORM } from "../../common/config/constant.config";

export default Joi.object().keys({
  token: Joi.string().required(),
  deviceId: Joi.string().required(),
  platform: Joi.string().required().valid(PLATFORM.ANDROID, PLATFORM.IOS),
});
