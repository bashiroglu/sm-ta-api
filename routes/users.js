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
  resizeUserPhoto,
  uploadUserPhoto,
  deleteMe,
  populateParticipations,
  assignPassword,
} = require("../controllers/userController");
const getCode = require("../utils/getCode");

const {
  protect,
  updatePassword,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.patch("/updateMyPassword", updatePassword);
router
  .route("/me")
  .get(assignCategory, assignParamsId, getUser)
  .patch(assignParamsId, updateMe, updateUser)
  .delete(assignParamsId, deleteMe);

router.use(restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/")
  .get(getUsers)
  .post(getCode("user"), assignPassword, createUser);
router
  .route("/role/:role")
  .get(getAllByRole, getUsers)
  .post(createUserByRole, assignPassword, createUser);

router
  .route("/role/student/participation")
  .get(populateParticipations, getUsers);

router
  .route("/role/student/:id/participation")
  .get(getAllByRole, populateParticipations, getUser);

router.route("/:id").get(getUser).patch(updateUser).delete(makeDeletedUser);
router
  .route("/:id/:category")
  .get(assignCategory, getUser)
  .patch(assignCategory, updateUser);
router.route("/:id/delete").delete(deleteUser);
router.route("/:id/active").patch(activateUser, updateUser);

module.exports = router;
