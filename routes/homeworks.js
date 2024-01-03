const express = require("express");
const {
  getHomeworks,
  createHomework,
  getHomework,
  updateHomework,
  deleteHomework,
} = require("../controllers/homeworkController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getHomeworks).post(createHomework);
router
  .route("/:id")
  .get(getHomework)
  .patch(updateHomework)
  .delete(makeDeleted, updateHomework);
router.route("/:id/archive").get(archive, updateHomework);
router.route("/:id/unarchive").get(archive, updateHomework);
router.route("/:id/delete").delete(deleteHomework);

module.exports = router;