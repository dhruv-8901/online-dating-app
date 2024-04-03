import Joi from "joi";

export default Joi.object({
  countryCode: Joi.string().required(),
  phone: Joi.number().required(),
  deviceId: Joi.string().required(),
});
