import express from "express";
import globalError from "./middlewares/globalError.js";
import mountMiddleware from "./middlewares/index.js";
import mountRoutes from "./routers/index.js";

const app = express();

// 1) MIDDLEWARE
mountMiddleware(app);

// 2) ROUTES
mountRoutes(app);

// Handle Global Error
app.use(globalError);

export default app;
