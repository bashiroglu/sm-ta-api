const express = require("express");
const Model = require("../models/inventoryModel");
const handlerFactory = require("./helpers/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));

router.route("/").get(getAll).post(getCode("inventory"), createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
