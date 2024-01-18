const express = require("express");
const Model = require("../models/userModel");
const handlerFactory = require("./helpers/handlerFactory");
const { protect, restrictTo } = require("../controllers/authController");
const { sendRes } = require("../utils/helpers");

const { getAll: getContacts } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo(["admin", "manager", "owner"]));

router.route("/").get(getContacts);

router.use(sendRes);
module.exports = router;
