const express = require("express");
const Model = require("../models/bookModel");
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
  .get(populate({ path: "createdBy", select: "name surname fullName" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, deleteOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);

router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne);

module.exports = router;
