const express = require("express");
const Model = require("../models/saleModel");
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);

const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getAll).post(getCode("sale"), createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(deleteOne);

module.exports = router;
