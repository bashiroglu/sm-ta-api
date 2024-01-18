const express = require("express");
const Model = require("../models/conversationModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  registerUser,
  unregisterUser,
  scheduleConversationNotifications,
  checkRole,
} = require("../controllers/conversationController");
const { setPassword } = require("../controllers/userController");
const {
  protect,
  restrictTo,
  signup,
} = require("../controllers/authController");
const { makeDeleted } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

scheduleConversationNotifications();

const router = express.Router();

router.use(checkRole);

router
  .route("/:id/register")
  .patch(setPassword, signup, registerUser, updateOne);

router.route("/").get(getAll);
router.route("/:id").get(getOne);

router.use(protect, restrictTo(["admin", "manager", "teacher"]));

router.route("/").post(createOne);
router.route("/:id").patch(checkRole, updateOne).delete(makeDeleted, updateOne);

router
  .route("/:id/register")
  .patch(registerUser, updateOne)
  .delete(unregisterUser, updateOne);

module.exports = router;
