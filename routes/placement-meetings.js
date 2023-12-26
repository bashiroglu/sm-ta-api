const express = require("express");
const {
  getPlacementMeetings,
  createPlacementMeeting,
  getPlacementMeeting,
  updatePlacementMeeting,
  makeDeletedPlacementMeeting,
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
  .delete(makeDeletedPlacementMeeting);
router.route("/:id/delete").delete(deletePlacementMeeting);

module.exports = router;
