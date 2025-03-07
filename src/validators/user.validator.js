import Joi from "joi";
import { Gender_Enum } from "../constants/constants.js";
import { calculateAge } from "../utils/helper.js";

export const updateProfileSchema = Joi.object()
  .min(1)
  .message(
    "At least one field is required from the following: firstName, lastName, mobileNumber, gender, DOB"
  )
  .keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    mobileNumber: Joi.string().length(11).optional(),
    gender: Joi.string()
      .valid(...Object.values(Gender_Enum))
      .optional(),
    DOB: Joi.date()
      .optional()
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

export const updatePasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
});
