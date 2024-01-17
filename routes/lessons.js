const express = require("express");
const Model = require("../models/lessonModel");
const handlerFactory = require("./helpers/handlerFactory");
const { prepareLesson } = require("../controllers/lessonController");
const {
  createTransactionOnLessonCreate,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));
router
  .route("/")
  .get(populate([{ path: "teacher", select: "name surname" }]), getAll, sendRes)
  .post(
    getCode("lesson"),
    prepareLesson,
    getCode("transaction"),
    createTransactionOnLessonCreate,
    createOne
  );
router
  .route("/:id")
  .get(populate({ path: "group", select: "name" }), getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);
router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
