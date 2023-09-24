const express = require("express");
const {
  getLessons,
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getLessons).post(restrictTo("user"), createLesson);
router
  .route("/:id")
  .get(getLesson)
  .patch(restrictTo("user", "admin"), updateLesson)
  .delete(restrictTo("user", "admin"), deleteLesson);

module.exports = router;
