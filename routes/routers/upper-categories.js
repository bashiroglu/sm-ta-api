const express = require("express");
const Model = require("../../models/upperCategoryModel");
const handlerFactory = require("../../utils/handlerFactory");

const { protect, restrictTo } = require("../../controllers/authController");
const { populate } = require("../../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo(["admin", "manager"]));
router
  .route("/")
  .get(populate({ path: "lowers" }), getAll)
  .post(createOne);

router.route("/:id").get(getOne).patch(updateOne);

module.exports = router;
