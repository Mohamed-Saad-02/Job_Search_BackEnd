import Joi from "joi";
import { calculateAge } from "../utils/helper.js";
import { Gender_Enum } from "../constants/constants.js";

export const signUpSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  mobileNumber: Joi.string().length(11).required(),
  gender: Joi.string()
    .valid(...Object.values(Gender_Enum))
    .required(),
  DOB: Joi.date()
    .required()
    .custom((value, helpers) => {
      const age = calculateAge(value);

      if (age < 18) {
        return helpers.error("custom", "You must be at least 18 years old");
      }

      return value;
    })
    .messages({
      custom: "You must be at least 18 years old",
    }),
});

export const confirmEmailSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const signInSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const signupGoogleSchema = Joi.object().keys({
  idToken: Joi.string().required(),
});

export const signinGoogleSchema = Joi.object().keys({
  idToken: Joi.string().required(),
});

export const forgetPasswordSchema = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  otp: Joi.string().required(),
});
