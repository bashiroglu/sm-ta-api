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
  createTokenAndSignIn
);
router.post("/login", login, createTokenAndSignIn);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword, createTokenAndSignIn);

// With router.use(protect) wrong
router.use(protect);
router.get("/logout", logout);
router.get("/get-user", getCurrentUser);
router.patch("/update-password", updatePassword, createTokenAndSignIn);

router.use(sendRes);
module.exports = router;
