import { json } from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

// 1. Rate-limiting setup
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 100, // limit to 100 requests per hour per IP
  message: "Too many requests from this IP, please try again after an hour",
  headers: true, // Include rate limit headers in the response
});

// 2. CORS setup
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: `http://localhost:${port}`, // Allow localhost in development
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const mountMiddleware = (app) => {
  // 3. Helmet for security headers
  app.use(helmet());

  // 4. Apply rate-limiting middleware
  app.use(limiter);

  // 5. Apply CORS middleware
  app.use(cors(corsOptions));

  // Morgan (only for development environment)
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Parse JSON request bodies
  app.use(json());
};

export default mountMiddleware;
