const express = require("express");
const {
  getBranches,
  createBranch,
  getBranch,
  updateBranch,
  archiveBranch,
  deleteBranch,
  assignCompany,
  getOnlyBlance,
  getStudentCount,
} = require("../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();
router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getBranches).post(assignCompany, createBranch);
router.route("/:id").get(getBranch).patch(updateBranch).delete(deleteBranch);
router.route("/:id/balance").get(getOnlyBlance, getBranch);
router.route("/:id/student-count").get(getStudentCount, getBranch);
router.route("/:id/archive").patch(archiveBranch);

module.exports = router;
