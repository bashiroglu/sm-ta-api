const express = require("express");
const Model = require("../models/feedbackModel");
const handlerFactory = require("./helpers/handlerFactory");
const { restrictFeedbacks } = require("../controllers/feedbackController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect);

router.use(restrictTo(["owner", "admin", "manager", "teacher"]));
router.route("/").post(getCode("feedback"), createOne);

router.route("/:id").patch(updateOne).delete(makeDeleted, updateOne);

router.use(restrictTo(["owner", "admin", "manager", "teacher"]));
router.route("/").get(restrictFeedbacks, getAll);
router
  .route("/:id")
  .get(
    restrictFeedbacks,
    populate({ path: "createdBy", select: "name surname" }),
    getOne
  );

module.exports = router;
