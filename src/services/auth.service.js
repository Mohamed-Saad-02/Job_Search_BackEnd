import { hash } from "bcryptjs";
import { OTP_Type_Enum, Provider_Enm } from "../constants/constants.js";
import { verifyGoogleToken } from "../lib/google.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { generateOtp, generateToken, verifyToken } from "../utils/helper.js";
import { sendEmailService } from "../utils/sendEmail.js";
import { v4 as uuIdv4 } from "uuid";

export const signupService = async (body) => {
  const { email } = body;

  // Check if email exist
  const exist = await User.exists({ email });
  if (exist) throw new AppError("Email already exist", 400);

  const otp = generateOtp();
  const hashedOTP = await hash(otp.toString(), 10);

  const user = await User.create({
    email,
    ...body,
    OTP: [
      {
        code: hashedOTP,
        type: OTP_Type_Enum.confirmEmail,
        expiresIn: Date.now() + 10 * 60 * 1000, // 10m
      },
    ],
  });

  if (user) {
    sendEmailService({
      to: email,
      subject: "Confirm Your Email",
      html: `<p>Your code is: <strong>${otp}</strong></p>`,
    });
  }

  return user;
};

export const confirmEmailService = async (email, userOTP) => {
  const user = await User.findOne({
    email,
    isConfirmed: false,
  }).select("+OTP");
  if (!user) throw new AppError("Invalid email or otp", 400);

  const storedOtp = user.OTP.find(
    async (otp) =>
      otp.type === OTP_Type_Enum.confirmEmail &&
      (await user.correctHashed(userOTP, otp.code))
  );

  if (!storedOtp) throw new AppError("Invalid email or otp", 400);

  const isExpired = Date.now() > Date.now(storedOtp.expiresIn);
  if (isExpired) throw new AppError("Expired otp", 400);

  const isMatch = await user.correctHashed(userOTP, storedOtp.code);
  if (!isMatch) throw new AppError("Invalid email or otp", 400);

  const currentUser = await User.findOneAndUpdate(
    { _id: user._id },
    {
      email,
      isConfirmed: true,
      $pull: {
        OTP: { _id: storedOtp._id },
      },
    },
    { new: true }
  );
  return currentUser;
};

export const signInService = async (email, password) => {
  const user = await User.findOne({
    email,
    isConfirmed: true,
    provider: Provider_Enm.System,
  }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 400);

  const isMatch = await user.correctHashed(password, user.password);
  if (!isMatch) throw new AppError("Invalid email or password", 400);

  // generate access_token and refresh_token
  const access_token = generateToken(
    { _id: user._id },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN,
    {
      jwtid: uuIdv4(),
    }
  );
  const refresh_token = generateToken(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN,
    {
      jwtid: uuIdv4(),
    }
  );

  return { access_token, refresh_token };
};

export const forgetPasswordService = async (email) => {
  const user = await User.findOne({ email, isConfirmed: true }).select("+OTP");
  if (!user) throw new AppError("Invalid email", 400);

  // generate OTP
  const OTP = generateOtp();

  // hash OTP
  const hashedOTP = await hash(OTP, 10);

  // save OTP
  user.OTP.push({
    code: hashedOTP,
    type: OTP_Type_Enum.forgetPassword,
    expiresIn: Date.now() + 10 * 60 * 1000, // 10m
  });
  await user.save();

  // send email
  sendEmailService({
    to: email,
    subject: "Forget Password",
    html: `<p>Your code is: <strong>${OTP}</strong></p>`,
  });
};

export const resetPasswordService = async (email, userOTP, password) => {
  const user = await User.findOne({ email, isConfirmed: true }).select("+OTP");
  if (!user) throw new AppError("Invalid email", 400);

  const storedOtp = user.OTP.find(
    async (otp) =>
      otp.type === OTP_Type_Enum.forgetPassword &&
      (await user.correctHashed(userOTP, otp.code))
  );

  if (!storedOtp) throw new AppError("Invalid email or otp", 400);

  const isExpired = Date.now() > Date.now(storedOtp.expiresIn);
  if (isExpired) throw new AppError("Expired otp", 400);

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      email,
      password,
      $pull: {
        OTP: { _id: storedOtp._id },
      },
    }
  );
};

export const signupGoogleService = async (body) => {
  const { idToken } = body;
  if (!idToken) throw new AppError("idToken field Required", 400);
  if (!idToken) throw new AppError("idToken field Required", 400);

  // verify id token by google
  const { email_verified, email, name, picture } = await verifyGoogleToken(
    idToken
  );
  if (!email_verified) throw new AppError("Email not verified", 400);

  // Check user exist with provider
  const user = await User.exists({ email });
  if (user) throw new AppError("User already exists", 400);

  // Create new user
  const newUser = new User({
    isConfirmed: true,
    firstName: name.split(" ")[0],
    lastName: name.split(" ")[1],
    email,
    profilePic: picture ?? "",
    provider: Provider_Enm.Google,
  });

  await newUser.save({ validateBeforeSave: false });
  res.status(201).json({ message: "User created successfully" });
};

export const signinGoogleService = async (body) => {
  const { idToken } = body;
  if (!idToken) throw new AppError("idToken field Required", 400);

  // verify id token by google
  const { email_verified, email } = await verifyGoogleToken(idToken);
  if (!email_verified) throw new AppError("Email not verified", 400);

  // Check user exist with provider
  const user = await User.findOne({
    email,
    provider: Provider_Enm.Google,
    isConfirmed: true,
  });
  if (!user) throw new AppError("User not found", 400);

  // Generate token
  const access_token = generateToken(
    { _id: user._id },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN
  );
  const refresh_token = generateToken(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN
  );

  res.status(200).json({
    message: "Signin successful",
    access_token,
    refresh_token,
  });
};

// @desc    Refresh token
// @route   POST /auth/refresh-token
// @access  Private
export const refreshTokenService = async (refresh_token) => {
  if (!refresh_token) throw new AppError("Refresh token not provided", 401);

  // Check if refresh_token valid
  const { _id, jti: tokenId } = verifyToken(
    refresh_token,
    process.env.JWT_REFRESH_SECRET
  );

  // Check if user still exists
  const user = await User.exists({ _id });
  if (!user) throw new AppError("User no longer exist", 404);

  // Create Access Token
  const access_token = generateToken(
    { _id },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN
  );

  return access_token;
};
