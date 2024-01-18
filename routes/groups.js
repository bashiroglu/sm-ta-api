const express = require("express");
const Model = require("../models/groupModel");

const handlerFactory = require("./helpers/handlerFactory");
const {
  crudGroupLessons,
  checkRole,
} = require("../controllers/groupController");
const { createEnrollments } = require("../controllers/enrollmentController");
const { protect, restrictTo } = require("../controllers/authController");
const lessonRouter = require("./lessons");
const { populate, makeDeleted } = require("../utils/helpers");

const { roles } = require("../utils/constants/enums");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(protect, restrictTo([roles.ADMIN, roles.MANAGER]));
router.route("/").get(getAll).post(createEnrollments, createOne);

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
    ]),
    getOne
  )
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/students").post(createEnrollments, getOne);

module.exports = router;
