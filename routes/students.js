const express = require("express");
const Model = require("../models/studentModel");
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);

const { archive, makeDeleted, populate } = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");
const { roles } = require("../utils/constants/enums");
const { prepareStudent } = require("../controllers/studentController");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", roles.OWNER, roles.ADMIN, roles.MANAGER)
);

router
  .route("/")
  .get(populate([{ path: "group" }, { path: "student" }]), getAll)
  .post(prepareStudent, createOne);

router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
