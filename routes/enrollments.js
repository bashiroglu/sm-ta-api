const express = require("express");
const Model = require("../models/enrollmentModel");
const handlerFactory = require("../utils/handlerFactory");
const {
  makeDeleted,
  populate,
  activate,
  deactivate,
} = require("../utils/helpers");
const { protect, restrictTo } = require("../controllers/authController");
const { roles } = require("../utils/constants/enums");
const { prepareEnrollment } = require("../controllers/enrollmentController");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo([roles.ADMIN, roles.MANAGER]));

router
  .route("/")
  .get(populate([{ path: "group" }, { path: "student" }]), getAll)
  .post(prepareEnrollment, createOne);

router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/activate").patch(activate, updateOne);
router.route("/:id/deactivate").patch(deactivate, updateOne);

module.exports = router;
