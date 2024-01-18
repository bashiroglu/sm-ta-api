const express = require("express");
const Model = require("../models/bookModel");
const handlerFactory = require("./helpers/handlerFactory");
const { populate, makeDeleted } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect);

router.route("/").get(getAll).post(createOne);

router
  .route("/:id")
  .get(populate({ path: "createdBy", select: "name surname fullName" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
