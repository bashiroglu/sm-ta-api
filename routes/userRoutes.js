const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");

const { creatUser, getUsers } = require("../controllers/userController");

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin", "manager", "owner"), creatUser)
  .get(protect, getUsers);
module.exports = router;
