const express = require("express");
const Model = require("../../models/lessonModel");
const handlerFactory = require("../../utils/handlerFactory");
const {
  prepareLesson,
  addHomeworks,
  checkTeacherLesson,
} = require("../../controllers/lessonController");
const {
  createTransactionOnLessonCreate,
} = require("../../controllers/transactionController");
const { protect, restrictTo } = require("../../controllers/authController");

const { populate, makeDeleted } = require("../../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["admin", "manager", "teacher"]));
router
  .route("/")
  .get(populate([{ path: "teacher", select: "name surname" }]), getAll)
  .post(prepareLesson, createTransactionOnLessonCreate, createOne);
router
  .route("/:id")
  .get(checkTeacherLesson, populate({ path: "group", select: "name" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router
  .route("/:id/add-homeworks")
  .patch(checkTeacherLesson, addHomeworks, updateOne);

router.route("/:id/results").get(
  checkTeacherLesson,
  populate(
    {
      path: "homeworks",
      populate: "tasks",
    },
    "homeworks"
  ),
  getOne
);

module.exports = router;
