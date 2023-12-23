const express = require("express");
const {
  getExams,
  createExam,
  getExam,
  updateExam,
  makeDeletedExam,
  deleteExam,
} = require("../controllers/examController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive } = require("../utils/helpers");

const router = express.Router();

router.use(protect);

router.route("/").get(getExams).post(getCode("exam"), createExam);
router
  .route("/:id")
  .get(populate([{ path: "subjects", select: "name" }]), getExam)
  .patch(updateExam)
  .delete(makeDeletedExam);

router.route("/:id/archive").get(archive, updateExam);
router.route("/:id/unarchive").get(archive, updateExam);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteExam);

module.exports = router;
