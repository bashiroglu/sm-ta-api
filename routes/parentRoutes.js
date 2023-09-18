const express = require("express");
const { getParents } = require("../controllers/parentController");
const { getUsers } = require("../controllers/userController");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

// router.use(protectMg);

router.route("/").get(getParents, getUsers);
// .patch(restrictTo("admin", "manager", "owner"), updateTour)
// .delete(restrictTo("admin", "manager", "owner"), deleteTour);

module.exports = router;
