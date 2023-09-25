const express = require("express");
const {
  getExams,
  createExam,
  getExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getExams).post(restrictTo("user"), createExam);
router
  .route("/:id")
  .get(getExam)
  .patch(restrictTo("user", "admin"), updateExam)
  .delete(restrictTo("user", "admin"), deleteExam);

module.exports = router;
