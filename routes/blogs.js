const express = require("express");
const Model = require("../models/blogModel");
const handlerFactory = require("./helpers/handlerFactory");
const { incrementViewCount } = require("../controllers/blogController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted, sendRes } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.route("/").get(getAll, sendRes);
router.route("/:id").get(getOne, sendRes);
router.route("/:id/view").get(incrementViewCount, updateOne, sendRes);

router.use(protect, restrictTo(["owner", "admin", "manager"]));
router.route("/").post(getCode("blog"), createOne, sendRes);
router
  .route("/:id")

  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
