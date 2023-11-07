const express = require("express");
const {
  getUpperCategories,
  createUpperCategory,
  getUpperCategory,
  updateUpperCategory,
  makeDeletedUpperCategory,
  deleteUpperCategory,
  createUpperAndLowers,
  injectPopOptions,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router
  .route("/")
  .get(injectPopOptions, getUpperCategories)
  .post(createUpperCategory);
router.route("/lowers").post(createUpperAndLowers, createUpperCategory);

router
  .route("/:id")
  .get(getUpperCategory)
  .patch(updateUpperCategory)
  .delete(makeDeletedUpperCategory);
router.route("/:id/delete").delete(deleteUpperCategory);

module.exports = router;
