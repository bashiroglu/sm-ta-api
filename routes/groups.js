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

const router = express.Router();

router.use("/:groupId/lessons", crudGroupLessons, lessonRouter);

router.use(protect);
router.route("/").get(getGroups).post(createGroup);
router.route("/:id").get(getGroup).patch(updateGroup).delete(makeDeletedGroup);
router
  .route("/:id/:field/:userId")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);
router.route("/:id/delete").delete(deleteGroup);

module.exports = router;
