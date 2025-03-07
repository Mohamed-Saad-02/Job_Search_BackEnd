import Company from "../../models/Company.js";
import APIFeatures from "../../utils/apiFeatures.js";
import AppError from "../../utils/appError.js";
import { protectAndAdmin } from "../utils/protect.js";

// ------- Query --------
// List All Companies that not banned or deleted
export const ListAllCompaniesResolver = async (_, args) => {
  const { access_token } = args;

  // Check is user and is role = admin
  await protectAndAdmin(access_token);

  const companiesCount = await Company.countDocuments();
  const features = new APIFeatures(Company.find(), args).paginate(
    companiesCount
  );
  const companies = await features.query.setOptions({
    disabledBannedDeleted: true,
  });

  return {
    metadata: { ...features.metadata, results: companies.length },
    companies,
  };
};

// Resolver
export const ApproveCompanyResolver = async (_, args) => {
  const { companyId, access_token } = args;

  // Check is user and is role = admin
  await protectAndAdmin(access_token);

  const company = await Company.findByIdAndUpdate(
    companyId,
    {
      approvedByAdmin: true,
    },
    { new: true }
  ).select("_id companyName createdBy HRs approvedByAdmin");

  if (!company) throw new AppError("Company not found", 404);

  return company;
};

export const BanOrUnbannedResolver = async (_, args) => {
  const { companyId, access_token } = args;

  // Check is user and is role = admin
  await protectAndAdmin(access_token);

  // Get Company
  const company = await Company.findById(companyId)
    .select("_id bannedAt")
    .setOptions({
      disabledBannedDeleted: true,
    });

  if (!company) throw new AppError("Company not found", 404);

  const isBanned = company.bannedAt
    ? { $unset: { bannedAt: "" } }
    : { $set: { bannedAt: Date.now() } };

  const updatedCompany = await Company.findByIdAndUpdate(companyId, isBanned, {
    new: true,
  })
    .select("_id companyName createdBy HRs approvedByAdmin bannedAt")
    .setOptions({
      disabledBannedDeleted: true,
    });

  if (!updatedCompany) throw new AppError("Company not found", 404);

  return updatedCompany;
};
