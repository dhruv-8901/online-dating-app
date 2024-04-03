import Joi from "joi";

export default Joi.object().keys({
  type: Joi.number().valid(1, 2, 3).required(),
});
