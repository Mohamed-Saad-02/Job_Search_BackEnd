import AppError from "../utils/appError.js";
import authRouter from "./authRouter.js";
import companyRouter from "./companyRouter.js";
import jobRouter from "./jobRouter.js";
import userRouter from "./userRouter.js";
import { GraphSchema } from "../GraphQL/main.schema.js";
import { createHandler } from "graphql-http/lib/use/express";
import chatRouter from "./chatRouter.js";

const mountRoutes = (app) => {
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/company", companyRouter);
  app.use("/jobs", jobRouter);
  app.use("/chat", chatRouter);

  app.use("/graphql", createHandler({ schema: GraphSchema }));

  app.use("/", (req, res) => res.status(200).json({ message: "Hello World!" }));

  // For All Routing not match above
  app.all("*", (req, res, next) =>
    next(new AppError(`Can't Find this route: ${req.originalUrl}`, 400))
  );
};

export default mountRoutes;
