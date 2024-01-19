const express = require("express");
const Model = require("../models/blogModel");
const handlerFactory = require("../utils/handlerFactory");
const { incrementViewCount } = require("../controllers/blogController");
const { protect, restrictTo } = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

router.route("/").get(getAll);
router.route("/:id").get(getOne);
router.route("/:id/view").get(incrementViewCount, updateOne);

router.use(protect, restrictTo(["admin", "manager"]));
router.route("/").post(createOne);
router.route("/:id").patch(updateOne).delete(makeDeleted, updateOne);

module.exports = router;
