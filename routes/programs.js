const express = require("express");
const Model = require("../models/programModel");
const handlerFactory = require("./helpers/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));

router.route("/").get(getAll).post(getCode("program"), createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
