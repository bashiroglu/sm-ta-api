const express = require("express");
const {
  getUpperCategories,
  createUpperCategory,
  createUpperAndLowers,
  getUpperCategory,
  updateUpperCategory,
  makeDeletedUpperCategory,
  deleteUpperCategory,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router
  .route("/")
  .get(populate({ path: "lowers" }), getUpperCategories)
  .post(createUpperCategory);
router.route("/lowers").post(createUpperAndLowers, createUpperCategory);

router.route("/:id").get(getUpperCategory).patch(updateUpperCategory);

module.exports = router;
