const express = require("express");
const Model = require("../models/feedbackModel");

const { getAll, getOne } = require("./helpers/handlerFactory")(Model);
const { restrictFeedbacks } = require("../controllers/feedbackController");
const { populate } = require("../utils/helpers");

const router = express.Router();

router.route("/").get(restrictFeedbacks, getAll);
router
  .route("/:id")
  .get(
    restrictFeedbacks,
    populate({ path: "createdBy", select: "name surname" }),
    getOne
  );

module.exports = router;
