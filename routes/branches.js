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
const { archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["owner", "admin", "manager"]));
router.route("/").get(getAll, sendRes).post(setCompany, createOne, sendRes);

router.use(restrictTo(["owner", "admin"]));

router
  .route("/stats/student-count")
  .get(getStatBranchesStudentCount, getAll, sendRes);
router
  .route("/stats/student-count/:id")
  .get(getStatBranchStudentCount, getOne, sendRes);
router
  .route("/stats/group-student-count")
  .get(getStatBranchesGroupStudentCount, getAll, sendRes);
router
  .route("/stats/student-count-by-months")
  .get(getStatBranchesStudentCountByMonths, getAll, sendRes);
router.route("/stats/balance").get(getStatBranchesBalance, getAll, sendRes);
router
  .route("/stats/income-by-months")
  .get(getStatBranchesIncomeByMonth, getAll, sendRes);

router
  .route("/:id")
  .get(getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);
router.route("/:id/balance").get(getOnlyBlance, getOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);

router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);
module.exports = router;
