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
const { sendRes } = require("../utils/helpers");

const router = express.Router();

router.post(
  "/signup",
  getCode("user", { modifier: "" }),
  signup,
  createTokenAndSignIn,
  sendRes
);
router.post("/login", login, createTokenAndSignIn, sendRes);

router.post("/forgotPassword", forgotPassword, sendRes);
router.patch(
  "/resetPassword/:token",
  resetPassword,
  createTokenAndSignIn,
  sendRes
);

// With router.use(protect) wrong
router.use(protect);
router.get("/logout", logout, sendRes);
router.get("/get-user", getCurrentUser, sendRes);
router.patch("/update-password", updatePassword, createTokenAndSignIn, sendRes);

module.exports = router;
