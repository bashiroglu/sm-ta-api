const express = require("express");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.route("/get-user").get(protect, getCurrentUser);

module.exports = router;
