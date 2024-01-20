const express = require("express");
const Model = require("../../models/notificationModel.js");
const handlerFactory = require("../../utils/handlerFactory");
const { protect, restrictTo } = require("../../controllers/authController");
const { roles } = require("../../utils/constants/enums");

const { getAll, getOne } = handlerFactory(Model);

const router = express.Router();

router.use(protect, restrictTo([roles.ADMIN, roles.MANAGER]));
router.route("/").get(getAll);
router.route("/:id").get(getOne);

module.exports = router;
