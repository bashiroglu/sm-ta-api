const express = require("express");
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  makeDeletedGroup,
  deleteGroup,
  crudGroupLessons,
  pushPullArray,
} = require("../controllers/groupController");
const { protect, restrictTo } = require("../controllers/authController");
const lessonRouter = require("./lessons");
const { populate, archive } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getGroups).post(getCode("group"), createGroup);
router
  .route("/:id")
  .get(
    populate([
      { path: "createdBy", select: "name surname" },
      { path: "students", select: "name surname code email" },
      { path: "teachers", select: "name surname code email" },
      { path: "room", select: "name number" },
    ]),
    getGroup
  )
  .patch(updateGroup)
  .delete(makeDeletedGroup);

router
  .route("/:id/students")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);

router
  .route("/:id/teachers")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);

router.route("/:id/archive").get(archive, updateGroup);
router.route("/:id/unarchive").get(archive, updateGroup);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteGroup);

module.exports = router;
