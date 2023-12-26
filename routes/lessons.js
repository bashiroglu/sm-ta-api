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
const { populate, archive } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);
router
  .route("/")
  .get(populate([{ path: "teacher", select: "name surname" }]), getLessons)
  .post(getCode("lesson"), createLesson);
router
  .route("/:id")
  .get(populate({ path: "group", select: "name" }), getLesson)
  .patch(updateLesson)
  .delete(makeDeletedLesson);
router.route("/:id/archive").get(archive, updateLesson);
router.route("/:id/unarchive").get(archive, updateLesson);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteLesson);

module.exports = router;
