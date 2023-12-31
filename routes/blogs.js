const express = require("express");
const Model = require("../models/blogModel");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
const { incrementViewCount } = require("../controllers/blogController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();
router.route("/").get(getAll);
router.route("/:id").get(getOne);
router.route("/:id/view").get(incrementViewCount, updateOne);

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));
router.route("/").post(getCode("blog"), createOne);
router
  .route("/:id")

  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
