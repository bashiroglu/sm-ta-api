const express = require("express");
const Model = require("../models/lessonModel");

const { getAll, createOne, getOne } = require("./helpers/handlerFactory")(
  Model
);
const { prepareLesson } = require("../controllers/lessonController");
const {
  createTransactionOnLessonCreate,
} = require("../controllers/transactionController");
const getCode = require("../utils/getCode");
const { populate } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

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
router.route("/:id").get(populate({ path: "group", select: "name" }), getOne);

module.exports = router;
