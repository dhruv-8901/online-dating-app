import Joi from "joi";

export default Joi.object().keys({
  dateId: Joi.string().required(),
});
