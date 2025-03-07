import { Router } from "express";
import protect from "../middlewares/protect.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { Role_Enum } from "../constants/constants.js";
import {
  addCompany,
  getApplicationsDayExcel,
} from "../controllers/company.controller.js";
import validateSchema from "../middlewares/validateSchema.js";
import {
  addCompanySchema,
  updateCompanySchema,
} from "../validators/company.validator.js";
import {
  updateCompany,
  deleteCompany,
  getSpecificCompany,
} from "../controllers/company.controller.js";
import jobRouter from "./jobRouter.js";
import { getCompanyName } from "../controllers/company.controller.js";

const companyRouter = Router();

companyRouter.use("/:companyId?/jobs/:id?", jobRouter);

companyRouter
  .route("/")
  .post(
    validateSchema(addCompanySchema),
    protect,
    authorizeRole(Role_Enum.User),
    addCompany
  )
  .put(
    validateSchema(updateCompanySchema),
    protect,
    authorizeRole(Role_Enum.User),
    updateCompany
  )
  .get(protect, getCompanyName);

// Router For Excel
companyRouter.get("/:id/applications/excel", protect, getApplicationsDayExcel);

companyRouter
  .route("/:id")
  .delete(
    protect,
    authorizeRole([Role_Enum.Admin, Role_Enum.User]),
    deleteCompany
  )
  .get(protect, getSpecificCompany);

export default companyRouter;
