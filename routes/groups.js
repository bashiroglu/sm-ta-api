const express = require("express");
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  crudGroupLessons,
  pushPullArray,
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
  .get(getGroups)
  .post(getCode("group"), convertStudents, createGroup);
router
  .route("/:id")
  .get(
    populate([
      { path: "createdBy", select: "name surname" },
      { path: "students.student", select: "name surname code email" },
      { path: "teachers", select: "name surname code email" },
      { path: "room", select: "name number" },
    ]),
    getGroup
  )
  .patch(updateGroup)
  .delete(makeDeleted, updateGroup);

router
  .route("/:id/students")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);

router
  .route("/:id/students/:studentId/toggle-status")
  .get(toggleStudentStatus, updateGroup);

router
  .route("/:id/teachers")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);

router.route("/:id/archive").get(archive, updateGroup);
router.route("/:id/unarchive").get(archive, updateGroup);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteGroup);

module.exports = router;
