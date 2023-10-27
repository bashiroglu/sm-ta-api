const express = require("express");
const {
  getHomeworks,
  createHomework,
  getHomework,
  updateHomework,
  makeDeletedHomework,
  deleteHomework,
} = require("../controllers/homeworkController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getHomeworks).post(createHomework);
router
  .route("/:id")
  .get(getHomework)
  .patch(updateHomework)
  .delete(deleteHomework);
router.route("/:id/delete").delete(deleteHomework);

module.exports = router;
