import Joi from "joi";
import {
  jobLocation_Enum,
  seniorityLevel_Enum,
  status_Enum,
  workingTime_Enum,
} from "../constants/constants.js";

export const addJobSchema = Joi.object({
  jobTitle: Joi.string().required(),
  jobLocation: Joi.string()
    .valid(...Object.values(jobLocation_Enum))
    .required(),
  workingTime: Joi.string()
    .valid(...Object.values(workingTime_Enum))
    .required(),
  seniorityLevel: Joi.string()
    .valid(...Object.values(seniorityLevel_Enum))
    .required(),
  jobDescription: Joi.string().required(),
  technicalSkills: Joi.array().items(Joi.string().trim()).required(),
  softSkills: Joi.array().items(Joi.string().trim()).required(),
  companyId: Joi.string().hex().length(24).message("Invalid id").required(),
});

export const updateJobSchema = Joi.object({
  jobTitle: Joi.string().optional(),
  jobLocation: Joi.string()
    .valid(...Object.values(jobLocation_Enum))
    .optional(),
  workingTime: Joi.string()
    .valid(...Object.values(workingTime_Enum))
    .optional(),
  seniorityLevel: Joi.string()
    .valid(...Object.values(seniorityLevel_Enum))
    .optional(),
  jobDescription: Joi.string().optional(),
  technicalSkills: Joi.array().items(Joi.string().trim()).optional(),
  softSkills: Joi.array().items(Joi.string().trim()).optional(),
  companyId: Joi.string().hex().length(24).message("Invalid id").optional(),
})
  .min(1)
  .message("must have at least 1 key");

export const applyJobSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid id",
    "string.length": "Invalid id",
  }),
});

export const applicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(status_Enum))
    .required(),
});
