const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const Model = require("../models/userModel");
const GroupModel = require("../models/groupModel");
const { getAll: getUsers, getOne: getUser } =
  require("./helpers/handlerFactory")(Model);
const { getAll: getGroups, getOne: getGroup } =
  require("./helpers/handlerFactory")(GroupModel);
const {
  getStudent,
  getStudents,
  directGroups,
  directLessons,
} = require("../controllers/teacherController");
const lessonRouter = require("./lessons");
const { populate } = require("../utils/helpers");

const router = express.Router();

router.use(protect, restrictTo("roles", "teacher"));

router.route("/groups").get(directGroups, getGroups);
router.route("/groups/:id").get(getGroup);

router.use("/groups/:id/lessons", directLessons, lessonRouter);
router.route("/students").get(getStudents, getUsers);
router.route("/students/:id").get(getStudent, getUser);
module.exports = router;

module.exports = router;
