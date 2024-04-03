import Joi from "joi";

export default Joi.object().keys({
  status: Joi.number().required(),
  name: Joi.alternatives().conditional("status", {
    is: 1,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  birthDate: Joi.alternatives().conditional("status", {
    is: 2,
    then: Joi.number().required(),
    otherwise: Joi.number().optional(),
  }),
  hieghtInFeet: Joi.alternatives().conditional("status", {
    is: 3,
    then: Joi.number().required(),
    otherwise: Joi.number().optional(),
  }),
  hieghtInInch: Joi.alternatives().conditional("status", {
    is: 3,
    then: Joi.number().required(),
    otherwise: Joi.number().optional(),
  }),
  address: Joi.alternatives().conditional("status", {
    is: 4,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  latitude: Joi.alternatives().conditional("status", {
    is: 4,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  longitude: Joi.alternatives().conditional("status", {
    is: 4,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  gender: Joi.alternatives().conditional("status", {
    is: 5,
    then: Joi.any().required(),
    otherwise: Joi.any().optional(),
  }),
  likeToDate: Joi.alternatives().conditional("status", {
    is: 6,
    then: Joi.any().required(),
    otherwise: Joi.any().optional(),
  }),
  agePreferenceFrom: Joi.alternatives().conditional("status", {
    is: 7,
    then: Joi.number().required(),
    otherwise: Joi.number().optional(),
  }),
  agePreferenceTo: Joi.alternatives().conditional("status", {
    is: 7,
    then: Joi.number().required(),
    otherwise: Joi.number().optional(),
  }),
  photos: Joi.string().optional(),
  daysToMeet: Joi.alternatives().conditional("status", {
    is: 9,
    then: Joi.any().required(),
    otherwise: Joi.any().optional(),
  }),
  socialLink: Joi.alternatives().conditional("status", {
    is: 10,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  referralCode: Joi.alternatives().conditional("status", {
    is: 10,
    then: Joi.string().optional(),
    otherwise: Joi.string().optional(),
  }),
  countryCode: Joi.alternatives().conditional("status", {
    is: 11,
    then: Joi.string().optional(),
    otherwise: Joi.string().optional(),
  }),
  phone: Joi.alternatives().conditional("status", {
    is: 11,
    then: Joi.number().optional(),
    otherwise: Joi.number().optional(),
  }),
  email: Joi.alternatives().conditional("status", {
    is: 11,
    then: Joi.string().email().optional(),
    otherwise: Joi.string().email().optional(),
  }),
});
