const express = require("express");
const getCode = require("../../utils/getCode");
const {
  signup,
  createTokenAndSignIn,
  login,
  forgotPassword,
  resetPassword,
} = require("../../controllers/authController");
const { sendRes } = require("../../utils/helpers");

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
router.patch("/resetPassword/:token", resetPassword, sendRes);

module.exports = router;
