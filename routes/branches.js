const express = require("express");
const Model = require("../models/branchModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  setCompany,
  getOnlyBlance,
  getStatBranchesStudentCount,
  getStatBranchStudentCount,
  getStatBranchesGroupStudentCount,
  getStatBranchesStudentCountByMonths,
  getStatBranchesBalance,
  getStatBranchesIncomeByMonth,
} = require("./../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["admin", "manager"]));
router.route("/").get(getAll).post(setCompany, createOne);

router.use(restrictTo(["admin"]));

router.route("/stats/student-count").get(getStatBranchesStudentCount, getAll);
router.route("/stats/student-count/:id").get(getStatBranchStudentCount, getOne);
router
  .route("/stats/group-student-count")
  .get(getStatBranchesGroupStudentCount, getAll);
router
  .route("/stats/student-count-by-months")
  .get(getStatBranchesStudentCountByMonths, getAll);
router.route("/stats/balance").get(getStatBranchesBalance, getAll);
router
  .route("/stats/income-by-months")
  .get(getStatBranchesIncomeByMonth, getAll);

router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);
router.route("/:id/balance").get(getOnlyBlance, getOne);

module.exports = router;
