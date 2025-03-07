import {
  addCompanyService,
  deleteCompanyService,
  getApplicationsDayExcelService,
  getCompanyNameService,
  getSpecificCompanyService,
  updateCompanyService,
} from "../services/company.service.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Add Company
// @route   POST /company
// @access  Private
export const addCompany = catchAsync(async (req, res) => {
  await addCompanyService(req.user, req.body);

  res.status(201).json({
    status: "success",
    message: "Company created successfully",
  });
});

// @desc    Update Company
// @route   PUT /company
// @access  Private
export const updateCompany = catchAsync(async (req, res) => {
  await updateCompanyService(req.user, req.body);

  res.status(201).json({
    status: "success",
    message: "Company Updated successfully",
  });
});

// @desc    Delete Company By Company user or Admin
// @route   DELETE /company/:id
// @access  Private
export const deleteCompany = catchAsync(async (req, res) => {
  await deleteCompanyService(req.user, req.params.id);

  res.status(204).json({
    status: "success",
    message: "Company Deleted successfully",
  });
});

// @desc    Get Specific Company with related jobs
// @route   GET /company/:id
// @access  Private
export const getSpecificCompany = catchAsync(async (req, res) => {
  const company = await getSpecificCompanyService(req.params.id);

  res.status(200).json({
    status: "success",
    data: company,
  });
});

// @desc    Get Company with name
// @route   GET /company?name=:name
// @access  Private
export const getCompanyName = catchAsync(async (req, res) => {
  const companies = await getCompanyNameService(req.query.name);

  res.status(200).json({
    status: "success",
    data: companies,
  });
});

// @desc    Get All Applications Day in Excel Sheet
// @route   GET /company/:id/applications/excel?date=2025/3/7
// @access  Private
export const getApplicationsDayExcel = catchAsync(async (req, res) => {
  const { buffer, companyName } = await getApplicationsDayExcelService(
    req.user,
    req.params.id,
    req.query.date
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=applications_${companyName}_${req.query.date}.xlsx`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.send(buffer);
});
