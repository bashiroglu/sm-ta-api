const express = require("express");
const {
  getPrograms,
  createProgram,
  getProgram,
  updateProgram,
  archiveProgram,
  deleteProgram,
} = require("../controllers/programController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getPrograms).post(createProgram);
router.route("/:id").get(getProgram).patch(updateProgram).delete(deleteProgram);
router.route("/:id/archive").patch(archiveProgram);

module.exports = router;
