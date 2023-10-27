const express = require("express");
const {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  makeDeletedSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.use(restrictTo("roles", "owner", "admin"));

router.route("/").get(getSubjects).post(createSubject);
router
  .route("/:id")
  .get(getSubject)
  .patch(updateSubject)
  .delete(makeDeletedSubject);
router.route("/:id/delete").delete(deleteSubject);

module.exports = router;
