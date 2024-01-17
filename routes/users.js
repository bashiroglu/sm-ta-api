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
} = require("./../controllers/userController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

scheduleBirthdayNotifications();

router.use(protect);
router
  .route("/me")
  .get(assignParamsId, getOne, sendRes)
  .patch(assignParamsId, updateMe, updateOne, sendRes)
  .delete(assignParamsId, makeDeleted, updateOne, sendRes);

router.use(restrictTo(["owner", "admin", "manager"]));

router
  .route("/role/:role")
  .get(getAllByRole, getAll, sendRes)
  .post(
    getCode("user", { modifier: "" }),
    createUserByRole,
    setPassword,
    createOne
  );

router.route("/role/student/tiny").get(aliasTinyStudent, getAll, sendRes);
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
  .get(getAll, sendRes)
  .post(getCode("user", { modifier: "" }), setPassword, createOne, sendRes);

router
  .route("/:id")
  .get(populate({ path: "positions", select: "title id" }), getOne, sendRes)
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);

router
  .route("/:id/tags")
  .get(setReqBody, updateOne, sendRes)
  .patch(setReqBody, updateOne, sendRes);
router
  .route("/:id/permissions")
  .get(setReqBody, getOne, sendRes)
  .patch(setReqBody, updateOne, sendRes);

router.route("/:id/activate").get(activateUser, updateOne, sendRes);
router.route("/:id/deactivate").get(deactivateUser, updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);

router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
