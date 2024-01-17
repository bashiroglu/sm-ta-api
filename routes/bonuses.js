const express = require("express");

const Model = require("../models/bonusModel");

const handlerFactory = require("./helpers/handlerFactory");
const { checkBonus } = require("../controllers/bonusController");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").get(getAll).post(createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(deleteOne);

module.exports = router;
