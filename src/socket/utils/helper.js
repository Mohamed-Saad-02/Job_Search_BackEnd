import User from "../../models/User.js";
import AppError from "../../utils/appError.js";
import { verifyToken } from "../../utils/helper.js";

export const protect = async (token) => {
  if (!token) throw new AppError("token is required", 400);

  // Verify token
  const decoded = verifyToken(token, process.env.JWT_SECRET);

  const currentUser = await User.findOne({
    _id: decoded._id,
    isConfirmed: true,
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
  }).select("+isConfirmed +changeCredentialTime +deletedAt");

  if (!currentUser) {
    return new AppError("invalid Credential or user no longer exist", 401);
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return new AppError(
      "User recently changed password! Please login again",
      401
    );
  }

  return currentUser;
};
