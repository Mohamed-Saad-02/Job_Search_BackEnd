import mongoose from "mongoose";
import Job from "./Job.js";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      unique: true,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    numberOfEmployees: {
      type: String,
      required: [true, "Number of employees is required"],
    },
    companyEmail: {
      type: String,
      unique: true,
      required: [true, "Company email is required"],
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy is required"],
    },
    Logo: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    HRs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    bannedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    legalAttachment: {
      secure_url: String,
      public_id: String,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
  options: {
    populate: {
      path: "addedBy",
      select: "firstName lastName _id",
      options: {
        lean: true,
      },
      transform: (doc) => ({
        username: `${doc.firstName} ${doc.lastName}`,
        _id: doc._id,
      }),
    },
  },
});

companySchema.pre(/^find/, function (next) {
  const isDisabledBannedAndDeleted =
    this.getOptions().disabledBannedDeleted || false;
  // Skip company that deleted and banned if the option is set
  if (!isDisabledBannedAndDeleted)
    this.where({ deletedAt: { $exists: false }, bannedAt: { $exists: false } });

  const isDisabledPopulate = this.getOptions().disablePopulate || false;
  if (isDisabledPopulate) return next(); // Skip population if the option is set

  this.populate([
    {
      path: "HRs",
      select: "firstName lastName _id",
      options: {
        lean: true,
      },
      transform: (doc) => ({
        username: `${doc.firstName} ${doc.lastName}`,
        _id: doc._id,
      }),
    },
    {
      path: "jobs",
    },
    {
      path: "createdBy",
      select: "firstName lastName _id",
      options: {
        lean: true,
      },
      transform: (doc) => ({
        username: `${doc.firstName} ${doc.lastName}`,
        _id: doc._id,
      }),
    },
  ]);
  next();
});

companySchema.pre("countDocuments", function (next) {
  this.where({ deletedAt: { $exists: false }, bannedAt: { $exists: false } });
  next();
});

// Delete all jobs related to this company
companySchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return; // Ensure doc exists
  if (!doc.deletedAt && !doc.bannedAt) return; // No need to proceed if neither is set

  const companyId = doc._id;

  try {
    // Delete all jobs related to this company
    await Job.deleteMany({ companyId });
  } catch (error) {
    console.error("Error in company post-findOneAndUpdate middleware:", error);
  }
});

// Based on Deleted Or Banned From User
companySchema.pre("updateMany", async function (next) {
  try {
    const query = this.getQuery(); // Get the query used for update
    const update = this.getUpdate(); // Get update fields

    if (!update.deletedAt && !update.bannedAt) {
      return next(); // Skip if neither deletedAt nor bannedAt is being updated
    }

    // Get all affected company IDs before updating them
    const companies = await this.model.find(query).select("_id");
    const companyIds = companies.map((company) => company._id);

    if (companyIds.length > 0)
      await Job.deleteMany({ companyId: { $in: companyIds } });

    next();
  } catch (error) {
    console.error("Error in Company pre-updateMany middleware:", error);
    next(error);
  }
});

const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;
