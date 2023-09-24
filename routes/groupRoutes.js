const express = require("express");
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getGroups).post(restrictTo("user"), createGroup);
router
  .route("/:id")
  .get(getGroup)
  .patch(restrictTo("user", "admin"), updateGroup)
  .delete(restrictTo("user", "admin"), deleteGroup);

module.exports = router;
