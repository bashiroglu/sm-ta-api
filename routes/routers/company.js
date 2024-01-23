const express = require("express");
const Model = require("../../models/companyModel");
const handlerFactory = require("../../utils/handlerFactory");
const {
  checkConstruction,
  aliasSetId,
} = require("../../controllers/companyController");
const { protect, restrictTo } = require("../../controllers/authController");
const { makeDeleted } = require("../../utils/helpers");
const { createOne, getOne, updateOne } = handlerFactory(Model);
const router = express.Router();
router.route("/is-under-construction").get(checkConstruction);
router.use(protect, restrictTo(["admin"]));
router
  .route("/")
  .post(createOne)
  .get(aliasSetId, getOne)
  .patch(aliasSetId, updateOne)
  .delete(aliasSetId, makeDeleted, updateOne);
module.exports = router;
