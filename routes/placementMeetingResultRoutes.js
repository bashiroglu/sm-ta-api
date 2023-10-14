const express = require("express");
const {
  getPlacementMeetingResults,
  createPlacementMeetingResult,
  getPlacementMeetingResult,
  updatePlacementMeetingResult,
  archivePlacementMeetingResult,
  deletePlacementMeetingResult,
} = require("../controllers/placementMeetingResultController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getPlacementMeetingResults)
  .post(createPlacementMeetingResult);
router
  .route("/:id")
  .get(getPlacementMeetingResult)
  .patch(updatePlacementMeetingResult)
  .delete(deletePlacementMeetingResult);
router.route("/:id/archive").patch(archivePlacementMeetingResult);

module.exports = router;
