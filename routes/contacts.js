const express = require("express");
const Model = require("../models/userModel");
const handlerFactory = require("./helpers/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");

const { getAll: getContacts } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo("roles", "admin", "manager", "owner"));

router.route("/").get(getContacts);

module.exports = router;
