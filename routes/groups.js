const express = require("express");
const Model = require("../models/groupModel");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
const {
  crudGroupLessons,
  toggleArrayEl,
  toggleStudentStatus,
  convertStudents,
} = require("../controllers/groupController");
const { protect, restrictTo } = require("../controllers/authController");
const lessonRouter = require("./lessons");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router
  .route("/")
  .get(getAll)
  .post(getCode("group"), convertStudents, createOne);
router
  .route("/:id")
  .get(
    populate([
      { path: "createdBy", select: "name surname" },
      { path: "students.student", select: "name surname code email" },
      { path: "teachers", select: "name surname code email" },
      { path: "room", select: "name number" },
    ]),
    getOne
  )
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router
  .route("/:id/students")
  .patch(toggleArrayEl, updateOne)
  .delete(toggleArrayEl, updateOne);

router
  .route("/:id/students/:studentId/toggle-status")
  .get(toggleStudentStatus, updateOne);

router
  .route("/:id/teachers")
  .patch(toggleArrayEl, updateOne)
  .delete(toggleArrayEl, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
