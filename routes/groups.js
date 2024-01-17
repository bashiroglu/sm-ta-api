const express = require("express");
const Model = require("../models/groupModel");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
const {
  crudGroupLessons,
  checkRole,
} = require("../controllers/groupController");
const { createEnrollments } = require("../controllers/enrollmentController");
const { protect, restrictTo } = require("../controllers/authController");
const lessonRouter = require("./lessons");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");
const { roles } = require("../utils/constants/enums");

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(
  protect,
  restrictTo("roles", roles.OWNER, roles.ADMIN, roles.MANAGER)
);
router
  .route("/")
  .get(getAll)
  .post(getCode("group"), createEnrollments, createOne);

router
  .route("/:id")
  .get(
    restrictTo("roles", roles.OWNER, roles.ADMIN, roles.MANAGER, roles.TEACHER),
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
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
