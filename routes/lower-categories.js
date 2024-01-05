const express = require("express");
const Model = require("../models/lowerCategoryModel");
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
const {
  queryByUpperSlug,
  sortDescending,
  checkDeletability,
  checkRestriction,
} = require("../controllers/lowerCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));

router.route("/").get(sortDescending, getAll).post(checkRestriction, createOne);
router.route("/upper/:slug").get(queryByUpperSlug, getAll);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(checkDeletability, makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), checkDeletability, deleteOne);

module.exports = router;
