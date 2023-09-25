const express = require("express");
const {
  getUser,
  getUsers,
  getAllByRole,
  createUser,
  updateUser,
  deleteUser,
  getMe,
} = require("./../controllers/userController");
const {
  protect,
  updatePassword,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.get("/me", getMe, getUser);

router.use(restrictTo("admin"));
router.route("/").get(getUsers).post(createUser);
router.get("/:role", getAllByRole, getUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
