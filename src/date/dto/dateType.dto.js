import Joi from "joi";

export default Joi.object().keys({
  type: Joi.number().valid(2, 3).required(),
});
