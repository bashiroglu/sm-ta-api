const express = require("express");
const Model = require("../models/feedbackModel");
const handlerFactory = require("./helpers/handlerFactory");
const { restrictFeedbacks } = require("../controllers/feedbackController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect);

router.use(restrictTo("roles", "owner", "admin", "manager", "teacher"));
router.route("/").post(getCode("feedback"), createOne);

router.route("/:id").patch(updateOne).delete(makeDeleted, updateOne);
router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

router.use(restrictTo("roles", "owner", "admin", "manager", "teacher"));
router.route("/").get(restrictFeedbacks, getAll);
router
  .route("/:id")
  .get(
    restrictFeedbacks,
    populate({ path: "createdBy", select: "name surname" }),
    getOne
  );

module.exports = router;
