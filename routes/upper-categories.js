const express = require("express");
const {
  getUpperCategories,
  createUpperCategory,
  createUpperAndLowers,
  getUpperCategory,
  updateUpperCategory,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router
  .route("/")
  .get(populate({ path: "lowers" }), getUpperCategories)
  .post(createUpperCategory);
router.route("/lowers").post(createUpperAndLowers, createUpperCategory);

router.route("/:id").get(getUpperCategory).patch(updateUpperCategory);

router.route("/:id/archive").get(archive, updateUpperCategory);
router.route("/:id/unarchive").get(archive, updateUpperCategory);

module.exports = router;
