const multer = require("multer");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config({ path: "./config.env" });

// ================ CLAUDINARY ====================
const cloudinary = require("cloudinary").v2;

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
      // width: 300,
      // height: 300,
      public_id: uuidv4(),
      resource_type: "auto", // jpeg, png
    });
    if (!result) return next(new AppError("add_file", 400));
  } else return next(new AppError("add_file", 400));

  const { public_id, url } = result;

  req.resObj = { public_id, url };
  next();
});

exports.remove = catchAsync(async (req, res, next) => {
  const data = await cloudinary.uploader.destroy(req.body.fileId);

  if (data.result !== "ok") return next(new AppError("try_again", 400));

  req.resObj = null;
  next();
});

// ================ GOOGLE CLOUD ====================
const multerCloudStorage = require("multer-cloud-storage");
const { Storage } = require("@google-cloud/storage");

const projectId = process.env.GCLOUD_PROJECT;
const bucketName = process.env.GCS_BUCKET;
const keyFilename = process.env.GCS_KEYFILE;

const storageGc = new Storage({ projectId, keyFilename });
const bucket = storageGc.bucket(bucketName);

const upload = multer({
  storage: multerCloudStorage.storageEngine({
    bucket: bucketName,
    filename: (req, file, cb) => {
      const uniqueFilename = uuidv4();
      const modifiedFilename = `${uniqueFilename}.${
        file.mimetype.split("/")[1]
      }`;
      cb(null, modifiedFilename);
    },
  }),
});

exports.uploadFileGc = upload.single("file");

exports.uploadGc = catchAsync(async (req, res, next) => {
  const { filename: public_id, linkUrl: url } = req.file;
  req.resObj = { public_id, url };
  next();
});

exports.removeGc = catchAsync(async (req, res, next) => {
  const [data] = await bucket.file(req.body.fileId).delete();
  if (data.statusCode !== 204) return next(new AppError("try_again", 400));

  req.resObj = null;
  next();
});
