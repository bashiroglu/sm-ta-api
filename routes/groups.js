const express = require("express");
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  makeDeletedGroup,
  deleteGroup,
} = require("../controllers/groupController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getGroups).post(createGroup);
router.route("/:id").get(getGroup).patch(updateGroup).delete(makeDeletedGroup);
router.route("/:id/delete").delete(deleteGroup);

module.exports = router;
