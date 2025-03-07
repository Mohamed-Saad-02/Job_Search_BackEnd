import { status_Enum } from "../constants/constants.js";
import { io } from "../db/index.js";
import Application from "../models/Application.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import { usersSocket } from "../socket/socket.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import { sendEmailService } from "../utils/sendEmail.js";

// @desc    Add Job by hr in company or owner
// @route   POST /jobs
// @access  Private
export const addJobService = async (user, data) => {
  //  Check if company exist
  const company = await Company.findOne({
    _id: data.companyId,
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
    approvedByAdmin: true,
  }).setOptions({ disablePopulate: true });
  if (!company) throw new AppError("Company not found or not approved", 404);

  // Check if user is not HR in company or owner
  if (
    !company.HRs.includes(user._id) &&
    user._id.toString() !== company.createdBy.toString()
  )
    throw new AppError("Unauthorized To add job", 401);

  // Add Job
  const job = await Job.create({ ...data, addedBy: user._id });
  return job;
};

// @desc    Update Job by the only who created the jop
// @route   PUT /jobs/:id
// @access  Private
export const updateJobService = async (user, data, companyId) => {
  // Check job exist
  const job = await Job.findById(companyId);
  if (!job) throw new AppError("Job not found", 404);

  // only who created the job can update it
  if (job.addedBy.toString() !== user._id.toString())
    throw new AppError("Unauthorized To update job", 401);

  const newJob = await Job.findOneAndUpdate({ _id: companyId }, data, {
    new: true,
  });
  return newJob;
};

// @desc    Delete Job by each one from HR company
// @route   DELETE /jobs/:id
// @access  Private
export const deleteJobService = async (user, jobId) => {
  // Check job exist
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);

  // Check if company exist
  const company = await Company.findById(job.companyId);
  if (!company) throw new AppError("Company not found", 404);

  // Check if user is hr in company
  if (!company.HRs.includes(user._id))
    throw new AppError("Unauthorized To delete job", 401);

  // Delete Job
  await Job.findOneAndDelete({ _id: jobId });
};

// @desc    Get Specific or All Jobs about company
// @route   GET companyId/jobs || /companyId/jobs/:id
// @access  Private
export const getJobsService = async (params, query) => {
  const { companyId, id: jobId } = params || {};
  const { company: companyName } = query;

  // If no filter return all jobs
  if (!companyId && !jobId && !companyName) {
    const features = new APIFeatures(Job.find(), query)
      .filter()
      .sort()
      .paginate();

    const jobs = await features.query.populate([
      {
        path: "companyId",
        select: "companyName _id",
        options: {
          lean: true,
        },
        transform: (doc) => ({
          companyName: doc.companyName,
          _id: doc._id,
        }),
      },
      {
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
    ]);
    return {
      metadata: { ...features.metadata, results: jobs.length },
      jobs,
    };
  }

  // If companyName filter return only jobs about that company
  let company;
  if (companyName) {
    company = await Company.findOne({
      companyName: new RegExp(companyName, "i"),
    });
  }

  const filter = {
    $or: [{ companyId }, { companyId: company?._id }],
  };
  if (jobId) filter._id = jobId;

  const count = await Job.countDocuments(filter);

  const features = new APIFeatures(Job.find(filter), query)
    .sort()
    .paginate(count);

  const jobs = await features.query.populate([
    {
      path: "companyId",
      select: "companyName _id",
      options: {
        lean: true,
      },
      transform: (doc) => ({
        companyName: doc.companyName,
        _id: doc._id,
      }),
    },
    {
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
  ]);

  return {
    metadata: { ...features.metadata, results: jobs.length },
    jobs,
  };
};

// @desc    Get All application for specific Job
// @route   GET /jobs/:id/applications
// @access  Private
export const getApplicationsService = async ({ user, jobId, queryStr }) => {
  const page = Number(queryStr.page) || 1;
  const limit = Number(queryStr.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = queryStr.sort?.createdAt ? { createdAt: -1 } : {};

  const job = await Job.findById(jobId).populate({
    path: "applications",
    options: {
      skip,
      limit,
      sort,
    },
  });
  if (!job) throw new AppError("Job not found", 404);

  // Check if user is authorized to view applications [hr or owner]
  const company = await Company.findById(job.companyId);
  if (!company) throw new AppError("Company not found");

  const isAuthorized =
    user._id.toString() === job.addedBy.toString() ||
    company.HRs.includes(user._id);

  if (!isAuthorized)
    throw new AppError("Unauthorized To view applications", 401);

  // Get length of all applications by this job;
  const applicationCount = await Application.countDocuments({
    jobId: job._id,
    userId: user._id,
  });

  return {
    metadata: {
      limit,
      results: job.applications.length,
      total: applicationCount,
      page,
      totalPages: Math.ceil(applicationCount / limit),
    },
    applications: job.applications,
  };
};

// @desc    Apply Job
// @route   POST /jobs/:id/apply
// @access  Private
export const applyJobService = async (user, jobId) => {
  const job = await Job.findOne({ _id: jobId, closed: false });
  if (!job) throw new AppError("Job not found", 404);

  const isApplied = await Application.findOne({
    jobId: job._id,
    userId: user._id,
  });
  if (isApplied) throw new AppError("You already applied to this job", 400);

  const application = await Application.create({
    jobId: job._id,
    userId: user._id,
  });

  // Notify All Hr Users that a new application has been received
  const company = await Company.findById(job.companyId);
  if (!company) throw new AppError("Company not found");

  // Get only connected HR socket IDs
  const hrSocketIds = company.HRs.map((hr) =>
    usersSocket.get(hr._id.toString())
  ).filter((socketId) => socketId); // Remove undefined values

  if (hrSocketIds.length > 0) {
    hrSocketIds.forEach((socketId) => {
      io.to(socketId).emit(
        "newApplication",
        `New Application from ${user.username}`
      );
    });
  }

  return application;
};

// @desc    Accept Or Reject Application
// @route   PUT /jobs/:id/applications/:appId/status
// @access  Private
export const statusApplicationService = async (user, jobId, appId, status) => {
  const job = await Job.findOne({ _id: jobId, closed: false });
  if (!job) throw new AppError("Job not found or closed", 404);

  // Check if user is authorized to update application [hr or owner]
  const company = await Company.findById(job.companyId);
  if (!company) throw new AppError("Company not found");

  const isAuthorized =
    user._id.toString() === job.addedBy.toString() ||
    company.HRs.includes(user._id);

  if (!isAuthorized)
    throw new AppError("Unauthorized To view applications", 401);

  const application = await Application.findOneAndUpdate(
    { _id: appId },
    { status },
    { new: true }
  ).populate([
    {
      path: "userId",
      select: "firstName lastName email",
      transform: (doc) => ({
        username: `${doc.firstName} ${doc.lastName}`,
        _id: doc._id,
        email: doc.email,
      }),
    },
    { path: "jobId", select: "jobTitle" },
  ]);
  if (!application) throw new AppError("Application not found", 404);

  if (status === status_Enum.accepted || status === status_Enum.rejected) {
    sendEmailService({
      to: application.userId.email,
      subject: `Application ${status}`,
      html: `<h1>Your application to ${application.jobId.jobTitle} has been ${status}.</h1>`,
    });
  }

  return application;
};
