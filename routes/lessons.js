const express = require("express");
const {
  getLessons,
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  prepareLesson,
} = require("../controllers/lessonController");
const {
  createTransactionOnly,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);
router
  .route("/")
  .get(populate([{ path: "teacher", select: "name surname" }]), getLessons)
  .post(
    getCode("lesson"),
    prepareLesson,
    getCode("transaction"),
    createTransactionOnly,
    createLesson
  );
router
  .route("/:id")
  .get(populate({ path: "group", select: "name" }), getLesson)
  .patch(updateLesson)
  .delete(makeDeleted, updateLesson);
router.route("/:id/archive").get(archive, updateLesson);
router.route("/:id/unarchive").get(archive, updateLesson);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteLesson);

module.exports = router;
