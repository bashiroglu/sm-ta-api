const express = require("express");
const {
  getBranches,
  createBranch,
  getBranch,
  updateBranch,
  archiveBranch,
  deleteBranch,
  assignCompany,
} = require("./../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getBranches).post(assignCompany, createBranch);
router.use(restrictTo("roles", "owner", "admin"));
router.route("/:id").get(getBranch).patch(updateBranch).delete(deleteBranch);
router.route("/:id/archive").patch(archiveBranch);

module.exports = router;
