const express = require("express");
const Model = require("../../models/userModel");
const GroupModel = require("../../models/groupModel");
const TransactionModel = require("../../models/transactionModel");
const EnrollmentModel = require("../../models/enrollmentModel");
const handlerFactory = require("../../utils/handlerFactory");

const { protect, restrictTo } = require("../../controllers/authController");
const {
  getStudent,
  getStudents,
  chekGroups,
  directLessons,
  checkTransactions,
  getBalance,
} = require("../../controllers/teacherController");
const lessonRouter = require("./lessons");
const exerciseRouter = require("./exercises");
const exerciseCatalogsRouter = require("./exercise-catalogs");
const { aliasSetQuery } = require("../../controllers/groupController");
const { getGroupLessons } = require("../../controllers/lessonController");

const { getAll: getUsers, getOne: getUser } = handlerFactory(Model);
const { getAll: getGroups, getOne: getGroup } = handlerFactory(GroupModel);
const { getAll: getTransactions, getOne: getTransaction } =
  handlerFactory(TransactionModel);
const { getAll: getEnrollments } = handlerFactory(EnrollmentModel);

const router = express.Router();

router.use(protect, restrictTo(["teacher"]));

router.route("/groups").get(chekGroups, getGroups);
router.route("/groups/:id").get(chekGroups, getGroup);
router
  .route("/groups/:id/lessons-overview")
  .get(chekGroups, aliasSetQuery, getEnrollments, getGroupLessons);

router.use("/groups/:groupId/lessons", directLessons, lessonRouter);
router.use("/exercises", exerciseRouter);
router.use("/exercise-catalogs", exerciseCatalogsRouter);

router.route("/transactions").get(checkTransactions, getTransactions);
router.route("/transactions/:id").get(checkTransactions, getTransaction);

router.route("/students").get(getStudents, getUsers);
router.route("/students/:id").get(getStudent, getUser);

router.route("/balance").get(getBalance, getUser);

module.exports = router;

module.exports = router;
