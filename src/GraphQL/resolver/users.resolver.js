import User from "../../models/User.js";
import APIFeatures from "../../utils/apiFeatures.js";
import AppError from "../../utils/appError.js";
import { protectAndAdmin } from "../utils/protect.js";

export const ListAllUsersResolver = async (root, args) => {
  const { access_token } = args;

  // Check is user and is role = admin
  await protectAndAdmin(access_token);

  const usersCount = await User.countDocuments();
  const features = new APIFeatures(User.find(), args).paginate(usersCount);
  const users = await features.query
    .select("+isConfirmed +deletedAt +bannedAt")
    .setOptions({ disabledBannedDeleted: true });

  return {
    metadata: { ...features.metadata, results: users.length },
    users,
  };
};

export const BanOrUnbannedResolver = async (_, args) => {
  const { userId, access_token } = args;

  // Check is user and is role = admin
  await protectAndAdmin(access_token);

  // Get Company
  const user = await User.findById(userId).select("_id bannedAt").setOptions({
    disabledBannedDeleted: true,
  });

  if (!user) throw new AppError("User not found", 404);

  const isBanned = user.bannedAt
    ? { $unset: { bannedAt: "" } }
    : { $set: { bannedAt: Date.now() } };

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { ...isBanned, updatedBy: userId },
    {
      new: true,
    }
  )
    .select("+isConfirmed +deletedAt +bannedAt")
    .setOptions({
      disabledBannedDeleted: true,
    });

  if (!updatedUser) throw new AppError("User not found", 404);

  return updatedUser;
};
