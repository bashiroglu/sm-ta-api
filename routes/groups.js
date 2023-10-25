const express = require("express");
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  archiveGroup,
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
router.route("/:id").get(getGroup).patch(updateGroup).delete(deleteGroup);
router
  .route("/:id/:field/:userId")
  .patch(pushPullArray, updateGroup)
  .delete(pushPullArray, updateGroup);
router.route("/:id/archive").patch(archiveGroup);

module.exports = router;
