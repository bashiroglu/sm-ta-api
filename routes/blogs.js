const express = require("express");
const Model = require("../models/blogModel");
const handlerFactory = require("./helpers/handlerFactory");
const { incrementViewCount } = require("../controllers/blogController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

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

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne);

module.exports = router;
