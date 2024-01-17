const express = require("express");
const name = "conversation";
const Model = require(`../models/${name}Model`);
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);

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
const { archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

scheduleConversationNotifications();

const router = express.Router();

router.use(checkRole);

// PUBIC
router
  .route("/:id/register")
  .patch(
    setPassword,
    getCode("user", { modifier: "" }),
    signup,
    registerUser,
    updateOne
  );

router.route("/:id").patch(checkRole, updateOne);
router
  .route("/:id/register")
  .patch(registerUser, updateOne)
  .delete(unregisterUser, updateOne);

module.exports = router;
