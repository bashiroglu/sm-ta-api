const express = require("express");
const Model = require("../models/lowerCategoryModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  queryByUpperSlug,
  sortDescending,
  checkDeletability,
  checkRestriction,
} = require("../controllers/lowerCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["owner", "admin", "manager"]));

router.route("/").get(sortDescending, getAll).post(checkRestriction, createOne);
router.route("/upper/:slug").get(queryByUpperSlug, getAll);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(checkDeletability, makeDeleted, updateOne);

module.exports = router;
