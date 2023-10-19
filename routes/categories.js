const express = require("express");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  archiveCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner"));
router.route("/").get(getCategories).post(createCategory);

router.use(restrictTo("roles", "owner", "admin"));
router
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);
router.route("/:id/archive").patch(archiveCategory);

module.exports = router;
