const multer = require("multer");
const multerCloudStorage = require("multer-cloud-storage");
const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

require("dotenv").config({ path: "./config.env" });

const projectId = process.env.GCLOUD_PROJECT;
const bucketName = process.env.GCS_BUCKET;
const keyFilename = process.env.GCS_KEYFILE;

const storage = new Storage({ projectId, keyFilename });
const bucket = storage.bucket(bucketName);

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

exports.uploadFile = upload.single("file");

exports.upload = catchAsync(async (req, res, next) => {
  const { filename: public_id, linkUrl: url } = req.file;
  req.obj = { data: { public_id, url } };
  next();
});

exports.remove = catchAsync(async (req, res, next) => {
  const [data] = await bucket.file(req.body.fileId).delete();
  if (data.statusCode !== 204) return next(new AppError("try_again", 400));
  req.status = 204;
  req.obj = { data: null };
  next();
});
