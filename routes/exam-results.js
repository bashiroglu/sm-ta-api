const express = require("express");
const {
  getExamResults,
  createExamResult,
  getExamResult,
  updateExamResult,
  archiveExamResult,
  deleteExamResult,
} = require("../controllers/examResultController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getExamResults).post(createExamResult);
router
  .route("/:id")
  .get(getExamResult)
  .patch(updateExamResult)
  .delete(deleteExamResult);
router.route("/:id/archive").patch(archiveExamResult);

module.exports = router;
