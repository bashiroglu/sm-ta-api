const express = require("express");
const {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  archiveSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.use(restrictTo("owner", "admin"));

router.route("/").get(getSubjects).post(createSubject);
router.route("/:id").get(getSubject).patch(updateSubject).delete(deleteSubject);
router.route("/:id/archive").patch(archiveSubject);

module.exports = router;
