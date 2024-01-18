const express = require("express");
const getCode = require("../utils/getCode");

const {
  protect,
  signup,
  login,
  createTokenAndSignIn,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updatePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  getCode("user", { modifier: "" }),
  signup,
  createTokenAndSignIn
);
router.post("/login", login, createTokenAndSignIn);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword, createTokenAndSignIn);

// With router.use(protect) wrong

router.get("/logout", protect, logout);
router.get("/get-user", protect, getCurrentUser);
router.patch("/update-password", protect, updatePassword, createTokenAndSignIn);

module.exports = router;
