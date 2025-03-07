import { Router } from "express";
import { Role_Enum } from "../constants/constants.js";
import {
  addJob,
  applyJob,
  deleteJob,
  getApplications,
  getJobs,
  statusApplication,
  updateJob,
} from "../controllers/job.controller.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import protect from "../middlewares/protect.js";
import validateSchema from "../middlewares/validateSchema.js";
import {
  addJobSchema,
  applyJobSchema,
  updateJobSchema,
  applicationStatusSchema,
} from "../validators/job.validator.js";

const jobRouter = Router({ mergeParams: true });

jobRouter
  .route("/")
  .get(protect, getJobs)
  .post(
    validateSchema(addJobSchema),
    protect,
    authorizeRole([Role_Enum.User]),
    addJob
  );

// Application
jobRouter.post(
  "/:id/apply",
  protect,
  authorizeRole(Role_Enum.User),
  validateSchema(applyJobSchema, "params"),
  applyJob
);

jobRouter.get("/:id/applications", protect, getApplications);
jobRouter.put(
  "/:id/applications/:appId/status",
  protect,
  authorizeRole(Role_Enum.User),
  validateSchema(applicationStatusSchema),
  statusApplication
);

// Job
jobRouter
  .route("/:id")
  .put(
    validateSchema(updateJobSchema),
    protect,
    authorizeRole([Role_Enum.User]),
    updateJob
  )
  .delete(protect, authorizeRole([Role_Enum.User]), deleteJob);

export default jobRouter;
