const express = require("express");
const {} = require("../controllers/teacherController");
const { protect, restrictTo } = require("../controllers/authController");
const {
  getStudent,
  getStudents,
  directGroups,
  directLessons,
} = require("../controllers/teacherController");
const { getUsers, getUser } = require("../controllers/userController");
const groupRouter = require("./groupRoutes");
const lessonRouter = require("./lessonRoutes");

const router = express.Router();

router.use(protect, restrictTo("teacher"));

router.use("/groups", directGroups, groupRouter);
router.use("/lessons", directLessons, lessonRouter);
router.route("/students").get(getStudents, getUsers);
router.route("/students/:id").get(getStudent, getUser);

module.exports = router;
