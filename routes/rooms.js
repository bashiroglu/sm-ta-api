const express = require("express");
const Model = require("../models/roomModel");
const handlerFactory = require("../utils/handlerFactory");
const { populate, makeDeleted } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect);

router.route("/").get(getAll).post(createOne);
router
  .route("/:id")
  .get(populate({ path: "branch", select: "name -managers" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
