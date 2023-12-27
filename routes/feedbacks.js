const express = require("express");
const {
  getFeedbacks,
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  restrictFeedbacks,
} = require("../controllers/feedbackController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(protect);

router.use(restrictTo("roles", "owner", "admin", "manager", "teacher"));
router.route("/").post(getCode("feedback"), createFeedback);

router.route("/:id").patch(updateFeedback).delete(makeDeleted, updateFeedback);
router.route("/:id/archive").get(archive, updateFeedback);
router.route("/:id/unarchive").get(archive, updateFeedback);
router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), deleteFeedback);

router.use(
  restrictTo("roles", "owner", "admin", "manager", "teacher", "guardian")
);
router.route("/").get(restrictFeedbacks, getFeedbacks);
router
  .route("/:id")
  .get(
    restrictFeedbacks,
    populate({ path: "createdBy", select: "name surname" }),
    getFeedback
  );

module.exports = router;
