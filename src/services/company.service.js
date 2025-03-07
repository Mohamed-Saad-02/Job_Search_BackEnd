import { Role_Enum } from "../constants/constants.js";
import Application from "../models/Application.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

import XLSX from "xlsx";
import { calculateAge, formatDate } from "../utils/helper.js";

const checkCompanyHRSAndNameAndEmail = async (
  hrs = [],
  companyName,
  companyEmail
) => {
  // Check if HRs exist and valid
  if (hrs?.length) {
    const users = await User.find({
      _id: { $in: hrs },
      isConfirmed: true,
      deletedAt: { $exists: false },
      bannedAt: { $exists: false },
    });
    if (users.length !== hrs.length)
      throw new AppError("User HR not found or not confirmed her email");
  }

  // Check if no company with this name or email
  const company = await Company.findOne({
    $or: [{ companyName }, { companyEmail }],
    deletedAt: { $exists: false },
    bannedAt: { $exists: false },
  });

  if (company)
    throw new AppError("There is Company with that email or name", 400);
};

// @desc    Add Company
// @route   POST /company
// @access  Private
export const addCompanyService = async (user, body) => {
  const { HRs, companyName, companyEmail } = body;

  // Check if HRs exist, valid and Check if no company with this name or email
  await checkCompanyHRSAndNameAndEmail(HRs, companyName, companyEmail);

  // Create Company
  const newCompany = await Company.create({ ...body, createdBy: user._id });
  return newCompany;
};

// @desc    Update Company
// @route   PUT /company
// @access  Private
export const updateCompanyService = async (user, body) => {
  const userCompany = await Company.findOne({ createdBy: user._id });
  if (!userCompany) throw new AppError("Company not found", 404);

  // Check if HRs exist, valid and Check if no company with this name or email
  await checkCompanyHRSAndNameAndEmail(
    body.HRs,
    body.companyName,
    body.companyEmail
  );

  await Company.findOneAndUpdate(
    {
      _id: user._id,
    },
    body
  );
};

// @desc    Delete Company By Company user or Admin
// @route   DELETE /company/:id
// @access  Private
export const deleteCompanyService = async (user, companyId) => {
  // Check if company exist and not deleted
  const company = await Company.findById(companyId);
  if (!company || company.deletedAt)
    throw new AppError("Company not found", 404);

  // if user Admin can delete the company
  if (user.role === Role_Enum.Admin)
    return await Company.findOneAndUpdate(
      {
        _id: companyId,
      },
      {
        deletedAt: Date.now(),
      }
    );

  if (user._id.toString() !== company.createdBy.toString())
    throw new AppError("Unauthorized", 401);

  return await Company.findOneAndUpdate(
    {
      _id: companyId,
    },
    {
      deletedAt: Date.now(),
    }
  );
};

// @desc    Get Specific Company with related jobs
// @route   GET /company/:id
// @access  Private
export const getSpecificCompanyService = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new AppError("Company not found", 404);

  return company;
};

// @desc    Get Company with name
// @route   GET /company?name=:name
// @access  Private
export const getCompanyNameService = async (name) => {
  if (!name) throw new AppError("query name required");

  const companies = await Company.find({
    companyName: { $regex: name, $options: "i" },
  }).setOptions({ disablePopulate: true });
  if (!companies.length) throw new AppError("Companies not found", 404);
  return companies;
};

// @desc    Get All Applications Day in Excel Sheet
// @route   GET /company/:id/applications/excel?date=2025/3/7
// @access  Private
export const getApplicationsDayExcelService = async (user, companyId, date) => {
  if (!date) throw new AppError("date is Required");

  const { _id: userId } = user;

  // Check company exist
  const company = await Company.findById(companyId).setOptions({
    disablePopulate: true,
  });
  if (!company) throw new AppError("Company not found");

  // Check The user is Hr in company or owner
  const owner = company.createdBy.toString() === userId.toString();
  const hr = company.HRs.find(
    (hr) => hr.toString() === userId.toString()
  ).toString();
  if (!hr && !owner) throw new AppError("Unauthorized", 400);

  // Get All Jobs company
  const jobsIds = await Job.find({ companyId }).select("_id");

  // Get All Applications for all Jobs Company in the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const applications = await Application.find({
    jobId: { $in: jobsIds },
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate([
      {
        path: "jobId",
        select: "-companyId",
      },
      {
        path: "userId",
        select: "firstName lastName _id email gender DOB",
        transform: (doc) => ({
          _id: doc._id,
          username: `${doc.firstName} ${doc.lastName}`,
          email: doc.email,
          gender: doc.gender,
          DOB: doc.DOB,
        }),
      },
    ])
    .select("-__v -updatedAt")
    .lean();

  if (!applications.length)
    throw new AppError("No applications found for this date", 404);

  // Prepare data for Excel
  const data = applications.map((app) => ({
    ApplicationID: app._id.toString() || "N/A",
    ApplicationStatus: app.status || "N/A",
    JobTitle: app.jobId?.jobTitle || "N/A",
    ApplicantName: app.userId?.username || "N/A",
    ApplicantEmail: app.userId?.email || "N/A",
    ApplicantGender: app.userId?.gender || "N/A",
    ApplicantDOB: app.userId?.DOB ? formatDate(app.userId?.DOB) : "N/A",
    ApplicantAge: app.userId?.DOB ? calculateAge(app.userId?.DOB) : "N/A",
    AppliedAt: formatDate(app.createdAt) || "N/A",
  }));

  // Create Excel file
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  // Write to buffer and send file
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return { companyName: "IRS", buffer };
};
