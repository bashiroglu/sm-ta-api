const express = require("express");
const Model = require("../models/upperCategoryModel");
const handlerFactory = require("./helpers/handlerFactory");

const {
  createUpperAndLowers,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["owner", "admin", "manager"]));
router
  .route("/")
  .get(populate({ path: "lowers" }), getAll)
  .post(createOne);
router.route("/lowers").post(createUpperAndLowers, createOne);

router.route("/:id").get(getOne).patch(updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);

module.exports = router;
