const express = require("express");
const Model = require("../models/companyModel");
const handlerFactory = require("./helpers/handlerFactory");
const { checkConstruction } = require("../controllers/companyController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);
const router = express.Router();

router.route("/is-under-construction").get(checkConstruction, sendRes);

router.use(protect);
router.use(restrictTo(["owner"]));
router.route("/").get(getAll, sendRes).post(createOne, sendRes);

router.use(restrictTo(["owner", "admin"]));
router
  .route("/:id")
  .get(getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);
router.route("/:id/delete").delete(deleteOne, sendRes);

module.exports = router;
