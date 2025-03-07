import {
  confirmEmailService,
  forgetPasswordService,
  refreshTokenService,
  resetPasswordService,
  signinGoogleService,
  signInService,
  signupGoogleService,
  signupService,
} from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Signup User
// @route   POST /auth/signup
// @access  Public
export const signUp = catchAsync(async (req, res) => {
  await signupService(req.body);

  res.status(201).json({
    status: "success",
    message: "Please Confirm Your email with otp that sent to you email",
  });
});

// @desc    Confirm Email User
// @route   POST /auth/confirm-email
// @access  Public
export const confirmEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const user = await confirmEmailService(email, otp);

  res.status(200).json({
    status: "success",
    message: "Email confirmed successfully",
  });
});

// @desc    Signin User
// @route   POST /auth/signin
// @access  Public
export const signIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { access_token, refresh_token } = await signInService(email, password);

  res.status(200).json({
    status: "success",
    message: "Signin successfully",
    access_token,
    refresh_token,
  });
});

// @desc    Signup with google
// @route   POST /auth/signup/google
// @access  Public
export const signupGoogle = catchAsync(async (req, res) => {
  await signupGoogleService(req.body);

  res.status(201).json({
    status: "success",
    message: "User created successfully",
  });
});

// @desc    Signin with google
// @route   POST /auth/signin/google
// @access  Public
export const signinGoogle = catchAsync(async (req, res) => {
  const { access_token, refresh_token } = await signinGoogleService(req.body);

  res.status(200).json({
    status: "success",
    message: "Signin successfully",
    access_token,
    refresh_token,
  });
});

// @desc    Forget Password
// @route   POST /auth/forget-password
// @access  Private
export const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  await forgetPasswordService(email);

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully to your email",
    message: "OTP sent successfully to your email",
  });
});

// @desc    Reset Password
// @route   POST /auth/reset-password
// @access  Private
export const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, password } = req.body;

  await resetPasswordService(email, otp, password);

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

// @desc    Refresh token
// @route   POST /auth/refresh-token
// @access  Private
export const refreshToken = catchAsync(async (req, res) => {
  let token = req.headers?.authorization?.split?.(" ")[1] || "";
  const access_token = await refreshTokenService(token);

  res.status(200).json({
    status: "success",
    access_token,
  });
});
