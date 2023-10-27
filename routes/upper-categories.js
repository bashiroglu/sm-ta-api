const express = require("express");
const {
  getUpperCategories,
  createUpperCategory,
  getUpperCategory,
  updateUpperCategory,
  makeDeletedUpperCategory,
  deleteUpperCategory,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").get(getUpperCategories).post(createUpperCategory);
router
  .route("/:id")
  .get(getUpperCategory)
  .patch(updateUpperCategory)
  .delete(deleteUpperCategory);
router.route("/:id/delete").delete(deleteUpperCategory);

module.exports = router;
