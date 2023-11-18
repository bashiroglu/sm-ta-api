const express = require("express");
const getCode = require("../utils/getCode");

const {
  protect,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updatePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", getCode("user"), signup);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);
router.get("/logout", logout);
router.get("/get-user", getCurrentUser);
router.patch("/update-password", updatePassword);

module.exports = router;
