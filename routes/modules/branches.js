const express = require("express");
const Model = require("../models/branchModel");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
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

const router = express.Router();

router.route("/").get(getAll).post(setCompany, createOne);

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

router.route("/:id/balance").get(getOnlyBlance, getOne);

module.exports = router;
