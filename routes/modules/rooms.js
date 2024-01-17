const express = require("express");
const Model = require("../models/roomModel");
const { getOne } = require("./helpers/handlerFactory")(Model);

const { populate } = require("../utils/helpers");

const router = express.Router();

router
  .route("/:id")
  .get(populate({ path: "branch", select: "name -managers" }), getOne);

module.exports = router;
