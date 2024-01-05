const express = require("express");
const Model = require("../models/companyModel");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
const { checkConstruction } = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const router = express.Router();

router.route("/is-under-construction").get(checkConstruction);

router.use(protect);
router.use(restrictTo("roles", "owner"));
router.route("/").get(getAll).post(createOne);

router.use(restrictTo("roles", "owner", "admin"));
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);
router.route("/:id/delete").delete(deleteOne);

module.exports = router;
