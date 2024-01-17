const express = require("express");
const Model = require("../models/bookModel");
const handlerFactory = require("./helpers/handlerFactory");
const { populate, archive, makeDeleted, sendRes } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect);

router.route("/").get(getAll, sendRes).post(createOne, sendRes);

router
  .route("/:id")
  .get(
    populate({ path: "createdBy", select: "name surname fullName" }),
    getOne,
    sendRes
  )
  .patch(updateOne, sendRes)
  .delete(makeDeleted, deleteOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);

router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
