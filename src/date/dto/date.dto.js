import Joi from "joi";

export default Joi.object().keys({
  venueId: Joi.string().required(),
  dateAndTime: Joi.date().required(),
});
