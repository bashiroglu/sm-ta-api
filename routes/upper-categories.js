const express = require("express");
const Model = require("../models/upperCategoryModel");
const handlerFactory = require("./helpers/handlerFactory");

const {
  createUpperAndLowers,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["owner", "admin", "manager"]));
router
  .route("/")
  .get(populate({ path: "lowers" }), getAll, sendRes)
  .post(createOne, sendRes);
router.route("/lowers").post(createUpperAndLowers, createOne, sendRes);

router.route("/:id").get(getOne, sendRes).patch(updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);

module.exports = router;
