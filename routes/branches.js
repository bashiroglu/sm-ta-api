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
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getAll).post(setCompany, createOne);

router.use(restrictTo("roles", "owner", "admin"));

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

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);

router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);
module.exports = router;
