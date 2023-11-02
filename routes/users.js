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
  populateParticipations,
  assignPassword,
  schedulePaymentNotifications,
} = require("./../controllers/userController");
const {
  protect,
  updatePassword,
  restrictTo,
} = require("../controllers/authController");
const getCode = require("../utils/getCode");

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

router
  .route("/role/student/participation")
  .get(getAllByRole, populateParticipations, getUsers);

router
  .route("/role/student/:id/participation")
  .get(populateParticipations, getUser);

router
  .route("/")
  .get(getUsers)
  .post(getCode("user"), assignPassword, createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(makeDeletedUser);
router
  .route("/:id/:category")
  .get(assignCategory, getUser)
  .patch(assignCategory, updateUser);
router.route("/:id/delete").delete(deleteUser);
router.route("/:id/active").patch(activateUser, updateUser);

module.exports = router;
