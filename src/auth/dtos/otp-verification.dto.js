import Joi from "joi";

export default Joi.object({
  type: Joi.number().required(),
  otp: Joi.number().required(),
  email: Joi.alternatives().conditional("type", {
    is: 2,
    then: Joi.string().email().required(),
    otherwise: Joi.string().email().forbidden(),
  }),
  countryCode: Joi.alternatives().conditional("type", {
    is: [1, 3],
    then: Joi.string().required(),
    otherwise: Joi.string().forbidden(),
  }),
  phone: Joi.alternatives().conditional("type", {
    is: [1, 3],
    then: Joi.number().required(),
    otherwise: Joi.number().forbidden(),
  }),
  deviceId: Joi.alternatives().conditional("type", {
    is: 3,
    then: Joi.string().required(),
    otherwise: Joi.string().forbidden(),
  }),
});
