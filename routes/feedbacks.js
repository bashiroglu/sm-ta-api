const express = require("express");
const {
  getFeedbacks,
  createFeedback,
  getFeedback,
  updateFeedback,
  makeDeletedFeedback,
  deleteFeedback,
  restrictFeedbacks,
} = require("../controllers/feedbackController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.use(restrictTo("roles", "owner", "admin", "teacher"));
router.route("/").post(createFeedback);

router.route("/:id").patch(updateFeedback).delete(makeDeletedFeedback);
router.route("/:id/delete").delete(deleteFeedback);

router.use(restrictTo("roles", "owner", "admin", "teacher", "guardian"));
router.route("/").get(restrictFeedbacks, getFeedbacks);
router.route("/:id").get(restrictFeedbacks, getFeedback);

module.exports = router;
