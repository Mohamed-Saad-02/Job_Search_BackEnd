import dotenv from "dotenv";
import mongoose from "mongoose";

import "../cron/cronJobs.js";

dotenv.config({ path: "./config.env" });

import app from "../app.js";
import { Server } from "socket.io";
import { establishIoConnection } from "../socket/socket.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD.replace("#", "%23")
);

// Connect DB
mongoose
  .connect(DB)
  .then(() => console.log("Connected DB 📒"))
  .catch((err) => console.log(err.message));

// 🛑 تأكد من أن الخادم لا يتم تشغيله أكثر من مرة
if (!global.serverInstance) {
  const port = process.env.PORT || 8000;
  global.serverInstance = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });

  global.ioInstance = new Server(global.serverInstance, {
    cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"],
    },
  });

  establishIoConnection(global.ioInstance);
}

// Handle Async Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  global.serverInstance?.close(() => process.exit(1));
});
