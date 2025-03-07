import mongoose from "mongoose";
import { status_Enum } from "../constants/constants.js";

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    userCV: {
      secure_url: String,
      public_id: String,
    },
    status: {
      type: String,
      enum: Object.values(status_Enum),
      default: status_Enum.pending,
    },
  },
  {
    timestamps: true,
  }
);

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export default Application;
