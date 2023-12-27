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
const { archive } = require("../utils/helpers");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getPlacementMeetings).post(createPlacementMeeting);
router
  .route("/:id")
  .get(getPlacementMeeting)
  .patch(updatePlacementMeeting)
  .delete(makeDeletedPlacementMeeting);

router.route("/:id/archive").get(archive, updatePlacementMeeting);
router.route("/:id/unarchive").get(archive, updatePlacementMeeting);
router.route("/:id/delete").delete(deletePlacementMeeting);

module.exports = router;
