const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const { upload, remove } = require("../controllers/fileController");

const router = express.Router();

router.use(protect);
router.route("/").post(upload).delete(remove);

module.exports = router;
