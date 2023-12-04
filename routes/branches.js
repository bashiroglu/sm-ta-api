const express = require("express");
const {
  createBranch,
  getBranch,
  getBranches,
  updateBranch,
  makeDeletedBranch,
  deleteBranch,
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

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getBranches).post(setCompany, createBranch);

router.use(restrictTo("roles", "owner", "admin"));

router
  .route("/stats/student-count")
  .get(getStatBranchesStudentCount, getBranches);
router
  .route("/stats/student-count/:id")
  .get(getStatBranchStudentCount, getBranch);
router
  .route("/stats/group-student-count")
  .get(getStatBranchesGroupStudentCount, getBranches);
router
  .route("/stats/student-count-by-months")
  .get(getStatBranchesStudentCountByMonths, getBranches);
router.route("/stats/balance").get(getStatBranchesBalance, getBranches);
router
  .route("/stats/income-by-months")
  .get(getStatBranchesIncomeByMonth, getBranches);

router
  .route("/:id")
  .get(getBranch)
  .patch(updateBranch)
  .delete(makeDeletedBranch);
router.route("/:id/balance").get(getOnlyBlance, getBranch);
router.route("/:id/delete").delete(deleteBranch);

module.exports = router;
