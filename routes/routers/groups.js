const express = require("express");
const Model = require("../../models/groupModel");
const EnrollmentModel = require("../../models/enrollmentModel");
const handlerFactory = require("../../utils/handlerFactory");

const {
  crudGroupLessons,
  checkRole,
  aliasSetQuery,
} = require("../../controllers/groupController");
const { createEnrollments } = require("../../controllers/enrollmentController");
const { protect, restrictTo } = require("../../controllers/authController");
const lessonRouter = require("./lessons");
const { populate, makeDeleted } = require("../../utils/helpers");

const { getGroupLessons } = require("../../controllers/lessonController");

const { roles } = require("../../utils/constants/enums");
const { getGroupLessons } = require("../../controllers/lessonController");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);
const { getAll: getEnrollments } = handlerFactory(EnrollmentModel);

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(protect, restrictTo([roles.ADMIN, roles.MANAGER]));

router
  .route("/")
  .get(
    populate([
      { path: "teacher", select: "name surname code email" },
      Model.schema.statics.studentsPopOpts,
      { path: "room", select: "name number" },
      { path: "program", select: "name" },
    ]),
    getAll
  )
  .post(createEnrollments, createOne);

router
  .route("/:id")
  .get(
    restrictTo([roles.ADMIN, roles.MANAGER, roles.TEACHER]),
    checkRole,
    populate([
      { path: "createdBy", select: "name surname" },
      Model.schema.statics.studentsPopOpts,
      { path: "teacher", select: "name surname code email" },
      { path: "room", select: "name number" },
      { path: "branch", select: "name" },
      { path: "program", select: "name" },
      { path: "level", select: "name" },
    ]),
    getOne
  )
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/students").post(createEnrollments, getOne);

router
  .route("/:id/lessons-overview")
  .get(aliasSetQuery, getEnrollments, getGroupLessons);

module.exports = router;
