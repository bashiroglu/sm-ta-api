const express = require("express");
const Model = require("../models/enrollmentModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  archive,
  makeDeleted,
  populate,
  activate,
  deactivate,
  sendRes,
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
  .get(populate([{ path: "group" }, { path: "student" }]), getAll, sendRes)
  .post(prepareEnrollment, createOne, sendRes);

router
  .route("/:id")
  .get(getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);

router.route("/:id/activate").get(activate, updateOne, sendRes);
router.route("/:id/deactivate").get(deactivate, updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
