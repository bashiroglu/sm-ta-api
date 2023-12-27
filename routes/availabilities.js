const express = require("express");
const {
  getAvailabilities,
  createAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  assignUser,
} = require("../controllers/availabilityController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

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
  .delete(makeDeleted, updateAvailability);

router.route("/:id/archive").get(archive, updateAvailability);
router.route("/:id/unarchive").get(archive, updateAvailability);
router.route("/:id/delete").delete(deleteAvailability);

module.exports = router;
