const express = require("express");
const Model = require("../models/companyModel");
const handlerFactory = require("./helpers/handlerFactory");
const { checkConstruction } = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);
const router = express.Router();

router.route("/is-under-construction").get(checkConstruction);

router.use(protect);
router.use(restrictTo(["owner"]));
router.route("/").get(getAll).post(createOne);

router.use(restrictTo(["owner", "admin"]));
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
