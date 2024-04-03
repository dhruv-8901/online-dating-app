import Joi from "joi";

export default Joi.object().keys({
  peopleId: Joi.string().required(),
});
