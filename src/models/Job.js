import mongoose from "mongoose";
import {
  jobLocation_Enum,
  seniorityLevel_Enum,
  workingTime_Enum,
} from "../constants/constants.js";
import { calculateAge } from "../utils/helper.js";
import Application from "./Application.js";

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocation_Enum),
      required: [true, "Job location is required"],
      trim: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTime_Enum),
      required: [true, "Working time is required"],
      trim: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevel_Enum),
      required: [true, "Seniority level is required"],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    technicalSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    softSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    addedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Added by is required"],
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: [true, "Company id is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",

  options: {
    populate: {
      path: "userId",
      select: "firstName lastName _id email DOB",
      transform: (doc) => ({
        username: `${doc.firstName} ${doc.lastName}`,
        _id: doc._id,
        email: doc.email,
        age: calculateAge(doc.DOB),
      }),
      options: {
        lean: true,
      },
    },
  },
});

// Based on Deleted From User and Company
jobSchema.pre("deleteMany", async function (next) {
  try {
    // Get job IDs before deletion
    const jobs = await this.model.find(this.getQuery()).select("_id");
    const jobIds = jobs.map((job) => job._id); // Extract job IDs

    // Delete applications linked to these jobs
    if (jobIds.length > 0)
      await Application.deleteMany({ jobId: { $in: jobIds } });

    next(); // Proceed with deleting jobs
  } catch (error) {
    console.error("Error in Job pre-deleteMany middleware:", error);
    next(error);
  }
});

// Delete All related Applications docs
jobSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    const jobId = doc._id;
    await Application.deleteMany({ jobId });
  } catch (error) {
    console.log(
      "error happen when try delete related applications docs: ",
      error
    );
  }
});

export default mongoose.models.Job || mongoose.model("Job", jobSchema);
