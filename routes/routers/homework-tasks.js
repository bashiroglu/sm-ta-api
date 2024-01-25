const express = require("express");
const Model = require("../../models/homeworkTaskModel");
const handlerFactory = require("../../utils/handlerFactory");
const { protect, restrictTo } = require("../../controllers/authController");
const { startEndTask } = require("../../controllers/homeworkTaskController");
const { makeDeleted } = require("../../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

const omTeacherRestrict = restrictTo(["admin", "manager", "teacher"]);
const omRestrict = restrictTo(["admin", "manager"]);
const studentRestrict = restrictTo(["student"]);

router.use(protect);

router
  .route("/")
  .get(omTeacherRestrict, getAll)
  .post(omTeacherRestrict, createOne);
router
  .route("/:id")
  .get(omTeacherRestrict, getOne)
  .patch(omTeacherRestrict, updateOne)
  .delete(omRestrict, makeDeleted, updateOne);

router.route("/:id/:action").patch(studentRestrict, startEndTask, updateOne);

module.exports = router;
