const express = require("express");
const {
  getLowerCategories,
  createLowerCategory,
  getLowerCategory,
  updateLowerCategory,
  archiveLowerCategory,
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
router
  .route("/:id")
  .get(getLowerCategory)
  .patch(updateLowerCategory)
  .delete(deleteLowerCategory);
router.route("/:id/archive").patch(archiveLowerCategory);
router.route("/upper/:slug").get(queryByUpperSlug);

module.exports = router;
