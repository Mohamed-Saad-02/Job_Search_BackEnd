import express from "express";
import protect from "../middlewares/protect.js";
import {
  deleteMe,
  getMe,
  getUser,
  updateMe,
} from "../controllers/user.controller.js";
import validateSchema from "../middlewares/validateSchema.js";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "../validators/user.validator.js";

const userRouter = express.Router();

userRouter
  .route("/me")
  .get(protect, getMe)
  .put(protect, validateSchema(updateProfileSchema), updateMe)
  .delete(protect, deleteMe);

userRouter
  .route("/me/update-password")
  .put(protect, validateSchema(updatePasswordSchema), updateMe);

userRouter.route("/:id").get(protect, getUser);

// 5. Upload Profile Pic ( 1 Grade)
// 6. Upload Cover Pic ( 1 Grade)
// 7. Delete Profile Pic ( 1 Grade)
// 8. Delete Cover Pic ( 1 Grade)

export default userRouter;
