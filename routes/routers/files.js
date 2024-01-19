const express = require("express");

const { protect } = require("../../controllers/authController");
const {
  // Cloudinary
  uploadFile,
  upload,
  remove,

  // Goofle Cloud
  uploadFileGc,
  uploadGc,
  removeGc,
} = require("../../controllers/fileController");

const router = express.Router();

router.use(protect);
router.route("/").post(uploadFile, upload).delete(remove);

module.exports = router;
