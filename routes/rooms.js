const express = require("express");
const Model = require("../models/roomModel");
const handlerFactory = require("./helpers/handlerFactory");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect);

router.route("/").get(getAll).post(createOne);
router
  .route("/:id")
  .get(populate({ path: "branch", select: "name -managers" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
