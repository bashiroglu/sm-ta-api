const express = require("express");
const {
  getLowerCategories,
  createLowerCategory,
  getLowerCategory,
  updateLowerCategory,
  makeDeletedLowerCategory,
  deleteLowerCategory,
  queryByUpperSlug,
  sortDescending,
  checkDeletability,
  checkRestriction,
} = require("../controllers/lowerCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/")
  .get(sortDescending, getLowerCategories)
  .post(checkRestriction, createLowerCategory);
router.route("/upper/:slug").get(queryByUpperSlug, getLowerCategories);
router
  .route("/:id")
  .get(getLowerCategory)
  .patch(updateLowerCategory)
  .delete(checkDeletability, makeDeleted, updateLowerCategory);

router.route("/:id/archive").get(archive, updateLowerCategory);
router.route("/:id/unarchive").get(archive, updateLowerCategory);
router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), checkDeletability, deleteLowerCategory);

module.exports = router;
