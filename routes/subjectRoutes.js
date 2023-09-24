const express = require("express");
const {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getSubjects).post(restrictTo("user"), createSubject);
router
  .route("/:id")
  .get(getSubject)
  .patch(restrictTo("user", "admin"), updateSubject)
  .delete(restrictTo("user", "admin"), deleteSubject);

module.exports = router;
