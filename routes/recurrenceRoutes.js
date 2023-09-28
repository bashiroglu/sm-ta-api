const express = require("express");
const {
  getRecurrence,
  createRecurrence,
  getRecurrence,
  updateRecurrence,
  deleteRecurrence,
} = require("../controllers/recurrenceController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRecurrence).post(restrictTo("user"), createRecurrence);
router
  .route("/:id")
  .get(getRecurrence)
  .patch(restrictTo("user", "admin"), updateRecurrence)
  .delete(restrictTo("user", "admin"), deleteRecurrence);

module.exports = router;
