const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");

const { getContacts } = require("../controllers/contactController");

const router = express.Router();

router.use(protect, restrictTo("roles", "admin", "manager", "owner"));

router.route("/").get(getContacts);

module.exports = router;
