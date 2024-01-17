const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const Model = require("../models/userModel");
const handlerFactory = require("./helpers/handlerFactory");
const GroupModel = require("../models/groupModel");
const {
  getStudent,
  getStudents,
  directGroups,
  directLessons,
} = require("../controllers/teacherController");
const lessonRouter = require("./lessons");
const { sendRes } = require("../utils/helpers");

const { getAll: getUsers, getOne: getUser } = handlerFactory(Model);
const { getAll: getGroups, getOne: getGroup } = handlerFactory(GroupModel);

const router = express.Router();

router.use(protect, restrictTo(["teacher"]));

router.route("/groups").get(directGroups, getGroups, sendRes);
router.route("/groups/:id").get(getGroup, sendRes);

router.use("/groups/:id/lessons", directLessons, lessonRouter);
router.route("/students").get(getStudents, getUsers, sendRes);
router.route("/students/:id").get(getStudent, getUser, sendRes);
module.exports = router;

module.exports = router;
