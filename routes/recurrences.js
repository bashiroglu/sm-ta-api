const express = require("express");
const {
  getRecurrence,
  createRecurrence,
  getRecurrences,
  updateRecurrence,
  makeDeletedRecurrence,
  deleteRecurrence,
} = require("../controllers/recurrenceController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getRecurrences).post(createRecurrence);
router
  .route("/:id")
  .get(getRecurrence)
  .patch(updateRecurrence)
  .delete(deleteRecurrence);
router.route("/:id/delete").delete(deleteRecurrence);

module.exports = router;
