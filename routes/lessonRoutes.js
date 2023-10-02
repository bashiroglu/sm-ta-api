const express = require("express");
const {
  getLessons,
  createLesson,
  getLesson,
  updateLesson,
  archiveLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getLessons).post(createLesson);
router.route("/:id").get(getLesson).patch(updateLesson).delete(deleteLesson);
router.route("/:id/archive").patch(archiveLesson);

module.exports = router;
