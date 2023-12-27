const express = require("express");
const {
  getPlacementMeetingResults,
  createPlacementMeetingResult,
  getPlacementMeetingResult,
  updatePlacementMeetingResult,
  deletePlacementMeetingResult,
} = require("../controllers/placementMeetingResultController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router
  .route("/")
  .get(getPlacementMeetingResults)
  .post(createPlacementMeetingResult);
router
  .route("/:id")
  .get(getPlacementMeetingResult)
  .patch(updatePlacementMeetingResult)
  .delete(makeDeleted, updatePlacementMeetingResult);

router.route("/:id/archive").get(archive, updatePlacementMeetingResult);
router.route("/:id/unarchive").get(archive, updatePlacementMeetingResult);
router.route("/:id/delete").delete(deletePlacementMeetingResult);

module.exports = router;
