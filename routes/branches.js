const express = require("express");
const {
  createBranch,
  getBranch,
  getBranches,
  updateBranch,
  makeDeletedBranch,
  deleteBranch,
  assignCompany,
  getOnlyBlance,
  getAllStudentCountStat,
  getOneStudentCountStat,
  getAllStudentCountStatByMonths,
  getAllBalanceStat,
  getAllBalanceStatByMonth,
} = require("./../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getBranches).post(assignCompany, createBranch);

router.use(restrictTo("roles", "owner", "admin"));

router.route("/stats/student-count").get(getAllStudentCountStat, getBranches);
router.route("/stats/student-count/:id").get(getOneStudentCountStat, getBranch);
router
  .route("/stats/student-count-by-months")
  .get(getAllStudentCountStatByMonths, getBranches);
router.route("/stats/balance").get(getAllBalanceStat, getBranches);
router
  .route("/stats/balance-by-months")
  .get(getAllBalanceStatByMonth, getBranches);

router
  .route("/:id")
  .get(getBranch)
  .patch(updateBranch)
  .delete(makeDeletedBranch);
router.route("/:id/balance").get(getOnlyBlance, getBranch);
router.route("/:id/delete").delete(deleteBranch);

module.exports = router;
