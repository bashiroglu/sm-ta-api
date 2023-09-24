const express = require("express");
const {
  getBranches,
  createBranch,
  getBranch,
  updateBranch,
  deleteBranch,
} = require("./../controllers/branchController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getBranches).post(restrictTo("user"), createBranch);
router
  .route("/:id")
  .get(getBranch)
  .patch(restrictTo("user", "admin"), updateBranch)
  .delete(restrictTo("user", "admin"), deleteBranch);

module.exports = router;
