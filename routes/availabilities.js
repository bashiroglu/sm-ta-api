const express = require("express");
const {
  getAvailabilities,
  createAvailability,
  getAvailability,
  updateAvailability,
  makeDeletedAvailability,
  deleteAvailability,
  assignUser,
} = require("../controllers/availabilityController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getAvailabilities).post(assignUser, createAvailability);
router
  .route("/:id")
  .get(getAvailability)
  .patch(updateAvailability)
  .delete(makeDeletedAvailability);
router.route("/:id/delete").delete(deleteAvailability);

module.exports = router;
