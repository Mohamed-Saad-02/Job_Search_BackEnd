import {
  addJobService,
  applyJobService,
  deleteJobService,
  getApplicationsService,
  getJobsService,
  statusApplicationService,
  updateJobService,
} from "../services/job.service.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Add Job by hr in company or owner
// @route   POST /jobs
// @access  Private
export const addJob = catchAsync(async (req, res) => {
  const job = await addJobService(req.user, req.body);

  res.status(201).json({
    status: "success",
    message: "Job created successfully",
    data: { job },
  });
});

// @desc    Update Job by the only who created the jop
// @route   PUT /jobs/:id
// @access  Private
export const updateJob = catchAsync(async (req, res) => {
  const job = await updateJobService(req.user, req.body, req.params.id);

  res.status(200).json({
    status: "success",
    message: "Job updated successfully",
    data: { job },
  });
});

// @desc    Delete Job by each one from HR company
// @route   DELETE /jobs/:id
// @access  Private
export const deleteJob = catchAsync(async (req, res) => {
  await deleteJobService(req.user, req.params.id);

  res.status(204).json({
    status: "success",
    message: "Job deleted successfully",
  });
});

// @desc    Get Specific or All Jobs about company
// @route   GET companyId/jobs || /companyId/jobs/:id
// @access  Private
export const getJobs = catchAsync(async (req, res) => {
  const jobs = await getJobsService(req.params, req.query);

  res.status(200).json({
    status: "success",
    data: { jobs },
  });
});

// @desc    Get All application for specific Job
// @route   GET /jobs/:id/applications
// @access  Private
export const getApplications = catchAsync(async (req, res) => {
  const applications = await getApplicationsService({
    user: req.user,
    jobId: req.params.id,
    queryStr: req.query,
  });

  res.status(200).json({
    status: "success",
    data: { applications },
  });
});

// @desc    Apply Job
// @route   POST /jobs/:id/apply
// @access  Private
export const applyJob = catchAsync(async (req, res) => {
  await applyJobService(req.user, req.params.id);

  res.status(200).json({
    status: "success",
    message: "Job applied successfully",
  });
});

// @desc    Accept Or Reject Application
// @route   PUT /jobs/:id/applications/:appId/status
// @access  Private
export const statusApplication = catchAsync(async (req, res) => {
  const application = await statusApplicationService(
    req.user,
    req.params.id,
    req.params.appId,
    req.body.status
  );

  res.status(200).json({
    status: "success",
    message: "Application status changed successfully",
    application,
  });
});
