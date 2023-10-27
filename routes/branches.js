const express = require("express");
const {
  getBranches,
  createBranch,
  getBranch,
  updateBranch,
  makeDeletedBranch,
  deleteBranch,
  assignCompany,
  getOnlyBlance,
  getStudentCount,
} = require("./../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getBranches).post(assignCompany, createBranch);
router.use(restrictTo("roles", "owner", "admin"));
router
  .route("/:id")
  .get(getBranch)
  .patch(updateBranch)
  .delete(makeDeletedBranch);
router.route("/:id/balance").get(getOnlyBlance, getBranch);
router.route("/:id/student-count").get(getStudentCount, getBranch);
router.route("/:id/delete").delete(deleteBranch);

module.exports = router;
