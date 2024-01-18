const express = require("express");
const Model = require("../models/lessonModel");
const handlerFactory = require("./helpers/handlerFactory");
const { prepareLesson } = require("../controllers/lessonController");
const {
  createTransactionOnLessonCreate,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");

const { populate, makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["admin", "manager", "teacher"]));
router
  .route("/")
  .get(populate([{ path: "teacher", select: "name surname" }]), getAll)
  .post(prepareLesson, createTransactionOnLessonCreate, createOne);
router
  .route("/:id")
  .get(populate({ path: "group", select: "name" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
