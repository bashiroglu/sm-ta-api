const express = require("express");
const Model = require("../models/inventoryModel");
const handlerFactory = require("./helpers/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));

router
  .route("/")
  .get(getAll, sendRes)
  .post(getCode("inventory"), createOne, sendRes);
router
  .route("/:id")
  .get(getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(deleteOne, sendRes);

module.exports = router;
