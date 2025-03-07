const validateSchema = (schema, key = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[key], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message);

      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: errorMessage,
      });
    }

    req[key] = value;

    next();
  };
};

export default validateSchema;
