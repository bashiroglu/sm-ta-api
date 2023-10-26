const express = require("express");
const {
  getFeedbacks,
  createFeedback,
  getFeedback,
  updateFeedback,
  archiveFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.use(restrictTo("roles", "owner", "admin", "teacher"));
router.route("/").post(createFeedback);

router
  .route("/:id")
  .get(getFeedback)
  .patch(updateFeedback)
  .delete(deleteFeedback);
router.route("/:id/archive").patch(archiveFeedback);

router.use(restrictTo("roles", "owner", "admin", "teacher", "guardian"));
router.get(getFeedbacks);

module.exports = router;
