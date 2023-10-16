const express = require("express");
const {
  createUser,
  createUserByRole,
  getUser,
  getUsers,
  getAllByRole,
  updateUser,
  deleteUser,
  archiveUser,
  activateUser,
  assignParamsId,
  updateMe,
  populateParticipations,
} = require("./../controllers/userController");
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
  .get(assignParamsId, getUser)
  .patch(assignParamsId, updateMe, updateUser)
  .delete(assignParamsId, archiveUser);

router.use(restrictTo("owner", "admin", "manager"));

router
  .route("/role/:role")
  .get(getAllByRole, getUsers)
  .post(createUserByRole, createUser);

router
  .route("/role/student/participation")
  .get(getAllByRole, populateParticipations, getUsers);

router
  .route("/role/student/:id/participation")
  .get(populateParticipations, getUser);

router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
router.route("/:id/archive").patch(archiveUser);
router.route("/:id/active").patch(activateUser, updateUser);

module.exports = router;
