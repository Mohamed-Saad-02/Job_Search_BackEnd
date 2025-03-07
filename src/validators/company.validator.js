import Joi from "joi";

export const addCompanySchema = Joi.object({
  companyName: Joi.string().required(),
  description: Joi.string().required(),
  industry: Joi.string().required(),
  address: Joi.string().required(),
  numberOfEmployees: Joi.string()
    .pattern(/^([1-9]\d*|0)(?:-([1-9]\d*|0))$/)
    .message("must be range such as 11-20 employee")
    .required(),
  companyEmail: Joi.string().email().required(),
  Logo: Joi.object({
    secure_url: Joi.string().required(),
    public_id: Joi.string().required(),
  }),
  coverPic: Joi.object({
    secure_url: Joi.string().required(),
    public_id: Joi.string().required(),
  }),
  HRs: Joi.array().items(Joi.string().hex().length(24)).required(),
});

export const updateCompanySchema = Joi.object({
  companyName: Joi.string().optional(),
  description: Joi.string().optional(),
  industry: Joi.string().optional(),
  address: Joi.string().optional(),
  numberOfEmployees: Joi.string()
    .pattern(/^([1-9]\d*|0)(?:-([1-9]\d*|0))$/)
    .message("must be range such as 11-20 employee")
    .optional(),
  companyEmail: Joi.string().email().optional(),
  Logo: Joi.object({
    secure_url: Joi.string().required(),
    public_id: Joi.string().required(),
  }),
  coverPic: Joi.object({
    secure_url: Joi.string().required(),
    public_id: Joi.string().required(),
  }),
  HRs: Joi.array().items(Joi.string().hex().length(24)).optional(),
}).min(1);
