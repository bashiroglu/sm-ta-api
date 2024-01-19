const express = require("express");
const Model = require("../models/userModel");
const handlerFactory = require("../utils/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");

const { getAll: getContacts } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["admin", "manager"]));

router.route("/").get(getContacts);

module.exports = router;
