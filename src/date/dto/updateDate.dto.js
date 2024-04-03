import Joi from "joi";

export default Joi.object().keys({
  venueId: Joi.string().optional(),
  dateAndTime: Joi.date().optional(),
});
