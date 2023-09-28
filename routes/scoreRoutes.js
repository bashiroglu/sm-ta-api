const express = require("express");
const {
  getScores,
  createScore,
  getScore,
  updateScore,
  deleteScore,
} = require("../controllers/scoreController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getScores).post(restrictTo("user"), createScore);
router
  .route("/:id")
  .get(getScore)
  .patch(restrictTo("user", "admin"), updateScore)
  .delete(restrictTo("user", "admin"), deleteScore);

module.exports = router;
