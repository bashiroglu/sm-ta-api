const express = require("express");
const Model = require("../models/upperCategoryModel");
const { getAll, updateOne } = require("./helpers/handlerFactory")(Model);

const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive } = require("../utils/helpers");

const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo("roles", "admin", "manager"));
router.route("/").get(populate({ path: "lowers" }), getAll);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);

module.exports = router;
