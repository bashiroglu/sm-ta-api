const express = require("express");
const {
  createUser,
  getUser,
  getUsers,
  getAllByRole,
  updateUser,
  deleteUser,
  archiveUser,
  getMe,
  updateMe,
  resizeUserPhoto,
  uploadUserPhoto,
  deleteMe,
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
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));
router.route("/").get(getUsers).post(createUser);
router.get("/:role", getAllByRole, getUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
router.route("/:id/archive").patch(archiveUser);

module.exports = router;
