const express = require("express");
const {
  createUser,
  createUserByRole,
  getUser,
  assignCategory,
  getUsers,
  getAllByRole,
  updateUser,
  deleteUser,
  makeDeletedUser,
  activateUser,
  assignParamsId,
  updateMe,
  assignPassword,
  schedulePaymentNotifications,
} = require("./../controllers/userController");
const {
  protect,
  updatePassword,
  restrictTo,
} = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate } = require("../utils/helpers");

const router = express.Router();

schedulePaymentNotifications();

router.use(protect);

router.patch("/updateMyPassword", updatePassword);

router
  .route("/me")
  .get(assignParamsId, getUser)
  .patch(assignParamsId, updateMe, updateUser)
  .delete(assignParamsId, makeDeletedUser);

router.use(restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/role/:role")
  .get(getAllByRole, getUsers)
  .post(getCode("user"), createUserByRole, assignPassword, createUser);

router.route("/role/student/participation").get(
  getAllByRole,
  populate([
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
  ]),
  getUser
);

router
  .route("/")
  .get(
    populate([
      { path: "subjects", select: "name" },
      { path: "packages", select: "name" },
    ]),
    getUsers
  )
  .post(getCode("user"), assignPassword, createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(makeDeletedUser);
router
  .route("/:id/:category")
  .get(assignCategory, getUser)
  .patch(assignCategory, updateUser);
router.route("/:id/delete").delete(deleteUser);
router.route("/:id/active").patch(activateUser, updateUser);

module.exports = router;
