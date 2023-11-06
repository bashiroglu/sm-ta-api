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
const { populate } = require("../utils/helpers");
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
      { path: "room", select: "name" },
    ]),
    getGroup
  )
  .patch(updateGroup)
  .delete(makeDeletedGroup);
router.route("/:id/delete").delete(deleteGroup);
router
  .route("/:id/:field")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);

module.exports = router;
