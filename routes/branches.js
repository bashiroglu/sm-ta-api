const express = require("express");
const {
  getBranches,
  createBranch,
  getBranch,
  updateBranch,
  archiveBranch,
  deleteBranch,
} = require("../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("owner"));
router.route("/").get(getBranches).post(createBranch);

router.use(restrictTo("owner", "admin"));
router.route("/:id").get(getBranch).patch(updateBranch).delete(deleteBranch);
router.route("/:id/archive").patch(archiveBranch);

module.exports = router;
