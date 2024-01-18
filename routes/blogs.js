const express = require("express");
const Model = require("../models/blogModel");
const handlerFactory = require("./helpers/handlerFactory");
const { incrementViewCount } = require("../controllers/blogController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.route("/").get(getAll);
router.route("/:id").get(getOne);
router.route("/:id/view").get(incrementViewCount, updateOne);

router.use(protect, restrictTo(["owner", "admin", "manager"]));
router.route("/").post(getCode("blog"), createOne);
router
  .route("/:id")

  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
