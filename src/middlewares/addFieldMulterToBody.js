import catchAsync from "../utils/catchAsync.js";

const addFieldMulterToBody = (paramNameInBody) =>
  catchAsync(async (req, res, next) => {
    if (req.file) {
      const url = `${req.protocol}://${req.headers.host}/${req.file.path}`;
      req.body[paramNameInBody] = url;
    } else if (req.files) {
      const urls = req.files.map(
        (file) => `${req.protocol}://${req.headers.host}/${file.path}`
      );
      req.body[paramNameInBody] = urls;
    }

    next();
  });

export default addFieldMulterToBody;
