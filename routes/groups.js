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
const { populate, archive, makeDeleted, sendRes } = require("../utils/helpers");
const getCode = require("../utils/getCode");
const { roles } = require("../utils/constants/enums");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(protect, restrictTo([roles.OWNER, roles.ADMIN, roles.MANAGER]));
router
  .route("/")
  .get(getAll, sendRes)
  .post(getCode("group"), createEnrollments, createOne, sendRes);

router
  .route("/:id")
  .get(
    restrictTo([roles.OWNER, roles.ADMIN, roles.MANAGER, roles.TEACHER]),
    checkRole,
    populate([
      { path: "createdBy", select: "name surname" },
      Model.schema.statics.studentsPopOpts,
      { path: "teacher", select: "name surname code email" },
      { path: "room", select: "name number" },
    ]),
    getOne
  )
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);

router.route("/:id/students").post(createEnrollments, getOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
