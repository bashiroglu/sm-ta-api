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
  getMe,
  updateMe,
  resizeUserPhoto,
  uploadUserPhoto,
  deleteMe,
  populateAbsents,
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
router.get("/me", getMe, getUser);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("owner", "admin"));

router.route("/").get(getUsers).post(createUser);
router
  .route("/role/:role")
  .get(getAllByRole, getUsers)
  .post(createUserByRole, createUser);

router.route("/role/student/:id/absent").get(populateAbsents, getUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
router.route("/:id/archive").patch(archiveUser);
router.route("/:id/active").patch(activateUser, updateUser);

module.exports = router;
