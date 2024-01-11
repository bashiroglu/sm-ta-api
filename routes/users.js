const express = require("express");
const Model = require("../models/userModel");
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
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
} = require("./../controllers/userController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

scheduleBirthdayNotifications();

router.use(protect);
router
  .route("/me")
  .get(assignParamsId, getOne)
  .patch(assignParamsId, updateMe, updateOne)
  .delete(assignParamsId, makeDeleted, updateOne);

router.use(restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/role/:role")
  .get(getAllByRole, getAll)
  .post(
    getCode("user", { modifier: "" }),
    createUserByRole,
    setPassword,
    createOne
  );

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

router
  .route("/")
  .get(getAll)
  .post(getCode("user", { modifier: "" }), setPassword, createOne);

router
  .route("/:id")
  .get(populate({ path: "positions", select: "title id" }), getOne)
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router
  .route("/:id/tags")
  .get(setReqBody, updateOne)
  .patch(setReqBody, updateOne);
router
  .route("/:id/permissions")
  .get(setReqBody, getOne)
  .patch(setReqBody, updateOne);

router.route("/:id/activate").get(activateUser, updateOne);
router.route("/:id/deactivate").get(deactivateUser, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);

router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
