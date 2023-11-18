const cloudinary = require("cloudinary").v2;
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

exports.upload = catchAsync(async (req, res, next) => {
  const { file } = req.body;
  let result;

  const folder = req.body.folder;
  const publicId = `${Date.now()}`;
  if (file) {
    result = await cloudinary.uploader.upload(file, {
      folder: folder,
      width: 300,
      height: 300,
      public_id: publicId,
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
