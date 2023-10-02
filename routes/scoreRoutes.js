const express = require("express");
const {
  getScores,
  createScore,
  getScore,
  updateScore,
  archiveScore,
  deleteScore,
} = require("../controllers/scoreController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getScores).post(createScore);
router.route("/:id").get(getScore).patch(updateScore).delete(deleteScore);
router.route("/:id/archive").patch(archiveScore);

module.exports = router;
