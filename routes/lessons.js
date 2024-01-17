const express = require("express");
const Model = require("../models/lessonModel");
const handlerFactory = require("./helpers/handlerFactory");
const { prepareLesson } = require("../controllers/lessonController");
const {
  createTransactionOnLessonCreate,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));
router
  .route("/")
  .get(populate([{ path: "teacher", select: "name surname" }]), getAll)
  .post(
    getCode("lesson"),
    prepareLesson,
    getCode("transaction"),
    createTransactionOnLessonCreate,
    createOne
  );
router
  .route("/:id")
  .get(populate({ path: "group", select: "name" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);
router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne);

module.exports = router;
