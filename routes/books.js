const express = require("express");
const Model = require("../models/bookModel");
const handlerFactory = require("./helpers/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");
const { archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));

router.route("/").get(getAll).post(createOne);
router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(deleteOne);

router.use(sendRes);
module.exports = router;
