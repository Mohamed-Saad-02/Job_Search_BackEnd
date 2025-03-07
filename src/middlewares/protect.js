import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { verifyToken } from "../utils/helper.js";

const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token) return next(new AppError("invalid token", 401));

  // Verify token
  const decoded = verifyToken(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findOne({
    _id: decoded._id,
    isConfirmed: true,
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
  }).select("+isConfirmed +changeCredentialTime +deletedAt");

  if (!currentUser) {
    return next(
      new AppError("invalid Credential or user no longer exist", 401)
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again", 401)
    );
  }

  req.user = currentUser;
  next();
});

export default protect;
