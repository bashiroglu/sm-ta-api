const express = require("express");
const {
  getHwtasks,
  createHwtask,
  getHwtask,
  updateHwtask,
  archiveHwtask,
  deleteHwtask,
} = require("../controllers/hwtaskController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getHwtasks).post(createHwtask);
router.route("/:id").get(getHwtask).patch(updateHwtask).delete(deleteHwtask);
router.route("/:id/archive").patch(archiveHwtask);

module.exports = router;
