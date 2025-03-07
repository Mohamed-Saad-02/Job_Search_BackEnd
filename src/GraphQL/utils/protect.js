import { Role_Enum } from "../../constants/constants.js";
import User from "../../models/User.js";
import AppError from "../../utils/appError.js";
import { verifyToken } from "../../utils/helper.js";

export const protect = async (token) => {
  // Verify token
  const decoded = verifyToken(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findOne({
    _id: decoded._id,
    isConfirmed: true,
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
  });

  if (!currentUser)
    throw new AppError("invalid Credential or user no longer exist", 401);

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    throw new AppError(
      "User recently changed password! Please login again",
      401
    );

  return currentUser;
};

export const protectAndAdmin = async (access_token) => {
  if (!access_token) throw new AppError("access_token is required");

  const user = await protect(access_token);
  if (user.role !== Role_Enum.Admin) throw new AppError("Unauthorized");

  return user;
};
