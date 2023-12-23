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
const { archive } = require("../utils/helpers");

const router = express.Router();

router.use(protect);

router.use(restrictTo("roles", "owner", "admin", "manager"));

router.route("/").get(getSubjects).post(createSubject);
router
  .route("/:id")
  .get(getSubject)
  .patch(updateSubject)
  .delete(makeDeletedSubject);

router.route("/:id/archive").get(archive, updateSubject);
router.route("/:id/unarchive").get(archive, updateSubject);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteSubject);

module.exports = router;
