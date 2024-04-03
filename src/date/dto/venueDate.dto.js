import Joi from "joi";

export default Joi.object().keys({
  date: Joi.date().required(),
});
