const express = require("express");
const Model = require("../models/lowerCategoryModel");
const { getAll, createOne, updateOne } = require("./helpers/handlerFactory")(
  Model
);
const {
  sortDescending,
  checkDeletability,
  checkRestriction,
} = require("../controllers/lowerCategoryController");
const { makeDeleted } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.route("/").get(sortDescending, getAll).post(checkRestriction, createOne);
router.route("/:id").delete(checkDeletability, makeDeleted, updateOne);

module.exports = router;
