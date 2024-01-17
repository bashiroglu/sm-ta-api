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
const { archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["owner", "admin", "manager"]));

router
  .route("/")
  .get(sortDescending, getAll, sendRes)
  .post(checkRestriction, createOne, sendRes);
router.route("/upper/:slug").get(queryByUpperSlug, getAll, sendRes);
router
  .route("/:id")
  .get(getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(checkDeletability, makeDeleted, updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router
  .route("/:id/delete")
  .delete(restrictTo(["admin"]), checkDeletability, deleteOne, sendRes);

module.exports = router;
