const express = require("express");
const {
  getLessons,
  createLesson,
  getLesson,
  updateLesson,
  makeDeletedLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);
router.route("/").get(getLessons).post(createLesson);
router
  .route("/:id")
  .get(getLesson)
  .patch(updateLesson)
  .delete(makeDeletedLesson);
router.route("/:id/delete").delete(deleteLesson);

module.exports = router;
