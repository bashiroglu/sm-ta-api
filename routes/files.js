const express = require("express");

const { protect } = require("../controllers/authController");
const {
  uploadFile,
  upload,
  remove,
  // } = require("../controllers/fileController_gc");
} = require("../controllers/fileController");
const { sendRes } = require("../utils/helpers");

const router = express.Router();

router.use(protect);
router.route("/").post(uploadFile, upload).delete(remove);

router.use(sendRes);
module.exports = router;
