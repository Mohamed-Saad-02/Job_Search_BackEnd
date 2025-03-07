import User from "../models/User.js";
import AppError from "../utils/appError.js";

// @desc    Update Me
// @route   PUT /users/me && /users/me/update-password
// @access  Private
export const updateMeService = async ({ user, body }) => {
  const updatedUser = await User.findOneAndUpdate({ _id: user._id }, body, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

// @desc    Get Me
// @route   GET /users/me
// @access  Private
export const getMeService = async ({ user }) => {
  const { firstName, lastName, email, mobileNumber, gender, DOB } = user;
  return {
    firstName,
    lastName,
    email,
    mobileNumber,
    gender,
    DOB,
  };
};

// @desc    Get User
// @route   GET /users/:id
// @access  Private
export const getUserService = async ({ userId }) => {
  const user = await User.findOne({
    _id: userId,
    isConfirmed: true,
    deletedAt: null,
  });
  if (!user) throw new AppError("User not found", 404);

  // get user info
  const { username, email, mobileNumber, gender, DOB, coverPic, profilePic } =
    user;

  return {
    username,
    email,
    mobileNumber,
    DOB,
    gender,
    coverPic: coverPic.secure_url,
    profilePic: profilePic.secure_url,
  };
};

// @desc    Delete Me
// @route   DELETE /users/me
// @access  Private
export const deleteMeService = async ({ user }) => {
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      deletedAt: Date.now(),
    },
    { new: true }
  ).select("+deletedAt +bannedAt");
};
