const express = require("express");
const Model = require("../models/availabilityModel");
const handlerFactory = require("./helpers/handlerFactory");
const { assignUser } = require("../controllers/availabilityController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));

router.route("/").get(getAll).post(assignUser, createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
