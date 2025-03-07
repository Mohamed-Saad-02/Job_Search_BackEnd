import {
  deleteMeService,
  getMeService,
  getUserService,
  updateMeService,
} from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Get Me
// @route   GET /users/me
// @access  Private
export const getMe = catchAsync(async (req, res) => {
  const { user } = req;
  const userInfo = await getMeService({ user });
  res.status(200).json({
    status: "success",
    data: {
      user: userInfo,
    },
  });
});

// @desc    Update Me
// @route   PUT /users/me && /users/me/update-password
// @access  Private
export const updateMe = catchAsync(async (req, res) => {
  const { user } = req;

  await updateMeService({ user, body: req.body });
  res.status(200).json({
    status: "success",
  });
});
// @desc    Delete Me
// @route   DELETE /users/me
// @access  Private
export const deleteMe = catchAsync(async (req, res) => {
  const { user } = req;

  await deleteMeService({ user });
  res.status(204).json({
    status: "success",
  });
});

// @desc    Get User
// @route   GET /users/:id
// @access  Private
export const getUser = catchAsync(async (req, res) => {
  const userInfo = await getUserService({ userId: req.params.id });
  res.status(200).json({
    status: "success",
    data: {
      user: userInfo,
    },
  });
});
