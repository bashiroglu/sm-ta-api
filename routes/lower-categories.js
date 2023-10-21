const express = require("express");
const {
  getLowerCategories,
  createLowerCategory,
  getLowerCategory,
  updateLowerCategory,
  archiveLowerCategory,
  deleteLowerCategory,
} = require("../controllers/lowerCategoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getLowerCategories).post(createLowerCategory);
router
  .route("/:id")
  .get(getLowerCategory)
  .patch(updateLowerCategory)
  .delete(deleteLowerCategory);
router.route("/:id/archive").patch(archiveLowerCategory);

module.exports = router;
