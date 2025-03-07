import multer from "multer";
import fs from "fs";
import AppError from "../utils/appError.js";
import { ImageExtinction } from "../constants/constants.js";

export const multerMiddleware = (
  destination = "general",
  allowedExtinction = []
) => {
  const destinationFolder = `assets/${destination}`;

  // Check if folder exist
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
  }

  // Storage Of multer
  const storage = multer.diskStorage({
    destination: destinationFolder,
    filename: (_, file, cb) => {
      const uniqueFile = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueFile}_${file.originalname}`);
    },
  });

  // Filter Allowed Files
  const fileFilter = (req, file, callback) => {
    if (
      allowedExtinction.length > 0 &&
      !allowedExtinction.includes(file.mimetype)
    ) {
      return callback(
        new AppError(
          `File type is not allowed, allowed: ${ImageExtinction.join(", ")}`,
          400
        )
      );
    }

    callback(null, true);
  };

  return multer({ storage, fileFilter });
};
