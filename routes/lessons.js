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
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(protect);

router.route("/").get(getLessons).post(getCode("lesson"), createLesson);
router
  .route("/:id")
  .get(getLesson)
  .patch(updateLesson)
  .delete(makeDeletedLesson);
router.route("/:id/delete").delete(deleteLesson);

module.exports = router;
