const express = require("express");
const controller = require("../controllers/lessonController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(controller["getLessons"])
  .post(controller["createLesson"]);
router
  .route("/:id")
  .get(controller["getLesson"])
  .patch(controller["updateLesson"])
  .delete(controller["deleteLesson"]);
router.route("/:id/archive").patch(controller["archiveLesson"]);

module.exports = router;
