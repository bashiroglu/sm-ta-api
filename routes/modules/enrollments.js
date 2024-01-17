const express = require("express");
const Model = require("../models/enrollmentModel");
const handlerFactory = require("./helpers/handlerFactory");
const { populate, activate, deactivate } = require("../utils/helpers");
const { prepareEnrollment } = require("../controllers/enrollmentController");

const { getAll, createOne, updateOne } = handlerFactory(Model);
const router = express.Router();
router
  .route("/")
  .get(populate([{ path: "group" }, { path: "student" }]), getAll)
  .post(prepareEnrollment, createOne);

router.route("/:id/activate").get(activate, updateOne);
router.route("/:id/deactivate").get(deactivate, updateOne);

module.exports = router;
