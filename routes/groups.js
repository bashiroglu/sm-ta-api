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
  .get(getAll)
  .post(getCode("group"), createEnrollments, createOne);

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
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/students").post(createEnrollments, getOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne);

router.use(sendRes);
module.exports = router;
