const express = require("express");
const {
  getExams,
  createExam,
  getExam,
  updateExam,
  makeDeletedExam,
  deleteExam,
} = require("../controllers/examController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getExams).post(createExam);
router.route("/:id").get(getExam).patch(updateExam).delete(makeDeletedExam);
router.route("/:id/delete").delete(deleteExam);

module.exports = router;
