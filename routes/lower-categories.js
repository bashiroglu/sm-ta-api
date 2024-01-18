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
  .delete(restrictTo(["admin"]), checkDeletability, deleteOne);

router.use(sendRes);
module.exports = router;
