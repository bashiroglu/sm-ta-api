const express = require("express");
const {
  getRecurrence,
  createRecurrence,
  getRecurrence,
  updateRecurrence,
  archiveRecurrence,
  deleteRecurrence,
} = require("../controllers/recurrenceController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRecurrence).post(createRecurrence);
router
  .route("/:id")
  .get(getRecurrence)
  .patch(updateRecurrence)
  .delete(deleteRecurrence);
router.route("/:id/archive").patch(archiveRecurrence);

module.exports = router;
