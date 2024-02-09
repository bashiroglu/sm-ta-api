const express = require("express");
const Model = require("../../models/exerciseCatalogModel");
const handlerFactory = require("../../utils/handlerFactory");

const { protect, restrictTo } = require("../../controllers/authController");
const { roles } = require("../../utils/constants/enums");
const { makeDeleted } = require("../../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo([roles.ADMIN, roles.MANAGER, roles.TEACHER]));

router.route("/").get(getAll).post(createOne);

router
  .route("/:id")
  .get(getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

module.exports = router;
