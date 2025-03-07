import { default as mongoose } from "mongoose";
import {
  Provider_Enm,
  Role_Enum,
  Gender_Enum,
  OTP_Type_Enum,
} from "../constants/constants.js";
import { Decryption, Encryption } from "../utils/encryption.js";
import { compare, hash } from "bcryptjs";
import Application from "./Application.js";
import Company from "./Company.js";
import Job from "./Job.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      trim: true,
    },
    provider: {
      type: String,
      enum: Object.values(Provider_Enm),
      default: Provider_Enm.System,
    },
    gender: {
      type: String,
      enum: Object.values(Gender_Enum),
    },
    DOB: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    mobileNumber: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Mobile number is required"],
    },
    role: {
      type: String,
      enum: Object.values(Role_Enum),
      default: Role_Enum.User,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
    bannedAt: {
      type: Date,
      select: false,
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      select: false,
    },
    changeCredentialTime: {
      type: Date,
      select: false,
    },
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    OTP: {
      type: [
        {
          code: String,
          type: {
            type: String,
            enum: Object.values(OTP_Type_Enum),
          },
          expiresIn: Date,
        },
      ],
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    id: false,
  }
);

userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password and encrypt mobile before save
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = parseInt(process.env.SALT_ROUNDS, 10);
    this.password = await hash(this.password, salt);
    this.changeCredentialTime = Date.now();
  }

  if (this.isModified("mobileNumber")) {
    this.mobileNumber = Encryption({
      value: this.mobileNumber,
      secretKey: process.env.SECRET_KEY,
    });
  }

  next();
});

// Hash password and encrypt mobile before update
userSchema.pre("findOneAndUpdate", async function (next) {
  if (this.getUpdate().password) {
    const salt = parseInt(process.env.SALT, 10);
    this.getUpdate().password = await hash(this.getUpdate().password, salt);
    this.getUpdate().changeCredentialTime = Date.now();
  }

  if (this.getUpdate().mobileNumber) {
    this.getUpdate().mobileNumber = Encryption({
      value: this.getUpdate().mobileNumber,
      secretKey: process.env.SECRET_KEY,
    });
  }

  next();
});

// decrypt mobile After find
userSchema.post(/^find/, function (doc, next) {
  if (Array.isArray(doc)) {
    doc.forEach((doc) => {
      if (doc?.mobileNumber)
        doc.mobileNumber = Decryption({
          cipher: doc.mobileNumber,
          secretKey: process.env.SECRET_KEY,
        });
    });
  } else {
    if (doc?.mobileNumber)
      doc.mobileNumber = Decryption({
        cipher: doc.mobileNumber,
        secretKey: process.env.SECRET_KEY,
      });
  }

  next();
});

// Deleted related documents And Banned it
userSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return; // Ensure doc exists
  if (!doc.deletedAt && !doc.bannedAt) return; // No need to proceed if neither is set

  const userId = doc._id;

  try {
    // Delete From Applications
    await Application.deleteMany({ userId });

    // Soft Delete Companies created by this user
    if (doc.deletedAt) {
      await Company.updateMany(
        { createdBy: userId },
        { deletedAt: Date.now() }
      );
    }

    // Ban Companies created by this user
    if (doc.bannedAt) {
      await Company.updateMany({ createdBy: userId }, { bannedAt: Date.now() });
    }

    // Remove user from HRs list in companies
    await Company.updateMany(
      { HRs: { $in: [userId] } },
      { $pull: { HRs: userId } }
    );

    // Delete Jobs created by the user
    await Job.deleteMany({ addedBy: userId });

    // Delete Jobs from Companies that were deleted or banned
    await Job.deleteMany({
      companyId: {
        $in: await Company.find({ createdBy: userId }).distinct("_id"),
      },
    });
  } catch (error) {
    console.error("Error in post-findOneAndUpdate middleware:", error);
  }
});

// Method to check value is correct with hashedValue
userSchema.methods.correctHashed = async function (candidate, hashed) {
  return await compare(candidate, hashed);
};

// Method to check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.changeCredentialTime) {
    const changedTimestamp = parseInt(
      this.changeCredentialTime.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.pre(/^find/, function (next) {
  const isDisabledBannedAndDeleted =
    this.getOptions().disabledBannedDeleted || false;

  // Skip Users that deleted and banned if the option is set
  if (!isDisabledBannedAndDeleted)
    this.where({ deletedAt: { $exists: false }, bannedAt: { $exists: false } });

  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
