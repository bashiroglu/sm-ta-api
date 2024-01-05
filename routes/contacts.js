const express = require("express");
const Model = require("../models/userModel");

const { getAll: getContacts } = require("./helpers/handlerFactory")(Model);

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "admin", "manager", "owner"));

router.route("/").get(getContacts);

module.exports = router;
