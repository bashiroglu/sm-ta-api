const express = require("express");

const {
  protect,
  login,
  getCurrentUser,
  createUser,
} = require("../controllers/authController");

const router = express.Router();

router.route("/register").post(createUser);
router.route("/login").post(login);
// router.route("/logout").get(protectMg, logout);
// router.route("/forgot-password").post(forgetPassword);
// router.route("/reset-password/:token").patch(resetPassword);
// router.route("/update-password").patch(protectMg, updatePassword);

router.route("/get-user").get(protect, getCurrentUser);

module.exports = router;
