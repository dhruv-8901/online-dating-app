import Joi from "joi";

export default Joi.object().keys({
  photoId: Joi.string().required(),
});
