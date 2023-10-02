const express = require("express");
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  archiveGroup,
  deleteGroup,
} = require("../controllers/groupController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getGroups).post(createGroup);
router.route("/:id").get(getGroup).patch(updateGroup).delete(deleteGroup);
router.route("/:id/archive").patch(archiveGroup);

module.exports = router;
