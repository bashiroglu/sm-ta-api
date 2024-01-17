const express = require("express");
const Model = require("../models/availability");
const handlerFactory = require("./helpers/handlerFactory");
const { assignUser } = require("../controllers/availabilityController");

const { createOne } = handlerFactory(Model);
router.route("/").post(assignUser, createOne);
module.exports = router;
