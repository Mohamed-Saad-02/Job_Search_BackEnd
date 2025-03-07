import { Router } from "express";
import {
  confirmEmail,
  forgetPassword,
  refreshToken,
  resetPassword,
  signIn,
  signinGoogle,
  signUp,
  signupGoogle,
} from "../controllers/auth.controller.js";
import validateSchema from "../middlewares/validateSchema.js";
import {
  confirmEmailSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  signinGoogleSchema,
  signInSchema,
  signupGoogleSchema,
  signUpSchema,
} from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/signup", validateSchema(signUpSchema), signUp);
authRouter.post(
  "/confirm-email",
  validateSchema(confirmEmailSchema),
  confirmEmail
);
authRouter.post("/signin", validateSchema(signInSchema), signIn);

// Oauth 2
authRouter.post(
  "/signup/google",
  validateSchema(signupGoogleSchema),
  signupGoogle
);
authRouter.post(
  "/signin/google",
  validateSchema(signinGoogleSchema),
  signinGoogle
);

authRouter.post(
  "/forget-password",
  validateSchema(forgetPasswordSchema),
  forgetPassword
);

authRouter.post(
  "/reset-password",
  validateSchema(resetPasswordSchema),
  resetPassword
);

authRouter.post("/refresh-token", refreshToken);

export default authRouter;
