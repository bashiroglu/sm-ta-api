const express = require("express");
const {
  getExamResults,
  createExamResult,
  getExamResult,
  updateExamResult,
  makeDeletedExamResult,
  deleteExamResult,
} = require("../controllers/examResultController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive } = require("../utils/helpers");

const router = express.Router();

router.use(protect);

router.route("/").get(getExamResults).post(createExamResult);
router
  .route("/:id")
  .get(getExamResult)
  .patch(updateExamResult)
  .delete(makeDeletedExamResult);

router.route("/:id/archive").get(archive, updateExamResult);
router.route("/:id/unarchive").get(archive, updateExamResult);

router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), deleteExamResult);

module.exports = router;
