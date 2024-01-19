const express = require("express");
const Model = require("../../models/companyModel");
const handlerFactory = require("../../utils/handlerFactory");
const { checkConstruction } = require("../../controllers/companyController");
const { protect, restrictTo } = require("../../controllers/authController");
const { makeDeleted } = require("../../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);
const router = express.Router();

router.route("/is-under-construction").get(checkConstruction);

router.use(protect, restrictTo(["admin"]));
router.route("/").get(getAll).post(createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
