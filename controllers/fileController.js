const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const dotenv = require("dotenv");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

dotenv.config({ path: "./config.env" });

// config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const parser = multer({ storage });

exports.uploadFile = parser.fields([{ name: "file" }, { name: "folder" }]);

exports.upload = catchAsync(async (req, res, next) => {
  let {
    files: { file },
    body: { folder },
  } = req;

  file = file.at(0);

  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = "data:" + file.mimetype + ";base64," + b64;

  let result;
  if (file) {
    result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      public_id: uuidv4(),
      resource_type: "auto", // jpeg, png
    });
    if (!result) return next(new AppError("add_file", 400));
  } else return next(new AppError("add_file", 400));

  const { public_id, url } = result;

  res.status(200).json({
    status: "success",
    data: { public_id, url },
  });
});

exports.remove = catchAsync(async (req, res, next) => {
  const data = await cloudinary.uploader.destroy(req.body.fileId);

  if (data.result !== "ok") return next(new AppError("try_again", 400));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
