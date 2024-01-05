const express = require("express");
const Model = require("../models/upperCategoryModel");
const { getAll, createOne, getOne, updateOne } =
  require("./helpers/handlerFactory")(Model);

const {
  createUpperAndLowers,
} = require("../controllers/upperCategoryController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router
  .route("/")
  .get(populate({ path: "lowers" }), getAll)
  .post(createOne);
router.route("/lowers").post(createUpperAndLowers, createOne);

router.route("/:id").get(getOne).patch(updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);

module.exports = router;
