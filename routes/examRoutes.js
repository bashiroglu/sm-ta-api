const express = require("express");
const {
  getExams,
  createExam,
  getExam,
  updateExam,
  archiveExam,
  deleteExam,
} = require("../controllers/examController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getExams).post(createExam);
router.route("/:id").get(getExam).patch(updateExam).delete(deleteExam);
router.route("/:id/archive").patch(archiveExam);

module.exports = router;
