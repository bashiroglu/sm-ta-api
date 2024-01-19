const express = require("express");
const Model = require("../../models/userModel");
const GroupModel = require("../../models/groupModel");
const handlerFactory = require("../../utils/handlerFactory");

const { protect, restrictTo } = require("../../controllers/authController");
const {
  getStudent,
  getStudents,
  directGroups,
  directLessons,
} = require("../../controllers/teacherController");
const lessonRouter = require("./lessons");

const { getAll: getUsers, getOne: getUser } = handlerFactory(Model);
const { getAll: getGroups, getOne: getGroup } = handlerFactory(GroupModel);

const router = express.Router();

router.use(protect, restrictTo(["teacher"]));

router.route("/groups").get(directGroups, getGroups);
router.route("/groups/:id").get(getGroup);

router.use("/groups/:id/lessons", directLessons, lessonRouter);
router.route("/students").get(getStudents, getUsers);
router.route("/students/:id").get(getStudent, getUser);

module.exports = router;

module.exports = router;
