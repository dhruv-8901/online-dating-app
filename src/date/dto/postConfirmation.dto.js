import Joi from "joi";

export default Joi.object().keys({
  isMeet: Joi.number().valid(1, 2).required(),
  type: Joi.alternatives().conditional("isMeet", {
    is: 2,
    then: Joi.number().valid(1, 2, 3).required(),
    otherwise: Joi.number().forbidden(),
  }),
});
