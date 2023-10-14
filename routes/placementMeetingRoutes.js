const express = require("express");
const {
  getPlacementMeetings,
  createPlacementMeeting,
  getPlacementMeeting,
  updatePlacementMeeting,
  archivePlacementMeeting,
  deletePlacementMeeting,
} = require("../controllers/placementMeetingController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getPlacementMeetings).post(createPlacementMeeting);
router
  .route("/:id")
  .get(getPlacementMeeting)
  .patch(updatePlacementMeeting)
  .delete(deletePlacementMeeting);
router.route("/:id/archive").patch(archivePlacementMeeting);

module.exports = router;
