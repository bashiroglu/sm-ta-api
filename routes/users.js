const express = require("express");
const Model = require("../models/userModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  createUserByRole,
  getAllByRole,
  assignParamsId,
  updateMe,
  setPassword,
  setReqBody,
  activateUser,
  deactivateUser,
  scheduleBirthdayNotifications,
  aliasTinyStudent,
  checkMembership,
} = require("./../controllers/userController");
const { protect, restrictTo } = require("../controllers/authController");

const { populate, makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

scheduleBirthdayNotifications();

router.use(protect);
router
  .route("/me")
  .get(assignParamsId, getOne)
  .patch(assignParamsId, updateMe, updateOne)
  .delete(assignParamsId, makeDeleted, updateOne);

router.use(restrictTo(["admin", "manager"]));

router
  .route("/role/:role")
  .get(getAllByRole, getAll)
  .post(createUserByRole, setPassword, createOne);

router.route("/role/student/tiny").get(aliasTinyStudent, getAll);
router.route("/role/student/participation").get(
  getAllByRole,
  populate([
    { path: "absents", select: "group" },
    { path: "presents", select: "_id group" },
  ]),
  getAll
);

router.route("/role/student/:id/participation").get(
  populate([
    { path: "absents", select: "group" },
    { path: "presents", select: "_id group" },
  ]),
  getOne
);

router.route("/").get(getAll).post(setPassword, createOne);

router
  .route("/:id")
  .get(populate({ path: "positions", select: "title id" }), getOne)
  .patch(updateOne)
  .delete(checkMembership, makeDeleted, updateOne);

router.route("/:id/tags").get(setReqBody, getOne).patch(setReqBody, updateOne);
router
  .route("/:id/permissions")
  .get(setReqBody, getOne)
  .patch(setReqBody, updateOne);

router.route("/:id/activate").patch(activateUser, updateOne);
router
  .route("/:id/deactivate")
  .patch(checkMembership, deactivateUser, updateOne);

module.exports = router;
