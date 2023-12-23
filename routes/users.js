const express = require("express");
const {
  createUser,
  createUserByRole,
  getUser,
  getUsers,
  getAllByRole,
  updateUser,
  deleteUser,
  makeDeletedUser,
  assignParamsId,
  updateMe,
  assignPassword,
  schedulePaymentNotifications,
  setReqBody,
  activateUser,
  deactivateUser,
} = require("./../controllers/userController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive } = require("../utils/helpers");

const router = express.Router();

schedulePaymentNotifications();

router.use(protect);
router
  .route("/me")
  .get(assignParamsId, getUser)
  .patch(assignParamsId, updateMe, updateUser)
  .delete(assignParamsId, makeDeletedUser);

router.use(restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/role/:role")
  .get(
    getAllByRole,
    populate([
      {
        path: "guardian",
        select: "name surname",
      },
      { path: "subjects", select: "name" },
      { path: "packages", select: "name" },
    ]),
    getUsers
  )
  .post(
    getCode("user", { modifier: "" }),
    createUserByRole,
    assignPassword,
    createUser
  );

router.route("/role/student/participation").get(
  getAllByRole,
  populate([
    {
      path: "guardian",
      select: "name surname",
    },
    {
      path: "packages",
      select: "name",
    },
    {
      path: "absents",
      select: "group",
    },
    {
      path: "presents",
      select: "_id group",
    },
  ]),
  getUsers
);

router.route("/role/student/:id/participation").get(
  populate([
    {
      path: "subject",
      select: "name",
    },
    {
      path: "packages",
      select: "name",
    },
    {
      path: "absents",
      select: "group",
    },
    {
      path: "presents",
      select: "_id group",
    },
    {
      path: "positions",
      select: "title id",
    },
  ]),
  getUser
);

router
  .route("/")
  .get(getUsers)
  .post(getCode("user", { modifier: "" }), assignPassword, createUser);

router
  .route("/:id")
  .get(
    populate([
      {
        path: "guardian",
        select: "name surname",
      },
      { path: "subjects", select: "name" },
      { path: "packages", select: "name" },
    ]),
    getUser
  )
  .patch(updateUser)
  .delete(makeDeletedUser);

router
  .route("/:id/tags")
  .get(setReqBody, getUser)
  .patch(setReqBody, updateUser);
router
  .route("/:id/permissions")
  .get(setReqBody, getUser)
  .patch(setReqBody, updateUser);

router.route("/:id/activate").get(activateUser, getUser);
router.route("/:id/deactivate").get(deactivateUser, getUser);

router.route("/:id/archive").get(archive, getUser);
router.route("/:id/unarchive").get(archive, getUser);

router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteUser);

module.exports = router;
