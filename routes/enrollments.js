const express = require("express");
const Model = require("../models/enrollmentModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  archive,
  makeDeleted,
  populate,
  activate,
  deactivate,
} = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");
const { roles } = require("../utils/constants/enums");
const { prepareEnrollment } = require("../controllers/enrollmentController");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo([roles.OWNER, roles.ADMIN, roles.MANAGER]));

router
  .route("/")
  .get(populate([{ path: "group" }, { path: "student" }]), getAll)
  .post(prepareEnrollment, createOne);

router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/activate").get(activate, updateOne);
router.route("/:id/deactivate").get(deactivate, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne);

module.exports = router;
