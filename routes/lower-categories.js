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
} = require("../controllers/lowerCategoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/")
  .get(sortDescending, getLowerCategories)
  .post(createLowerCategory);
router.route("/upper/:slug").get(queryByUpperSlug, getLowerCategories);
router
  .route("/:id")
  .get(getLowerCategory)
  .patch(updateLowerCategory)
  .delete(makeDeletedLowerCategory);
router.route("/:id/delete").delete(deleteLowerCategory);

module.exports = router;
