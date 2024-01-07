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

router
  .route("/:id/register")
  .patch(
    setPassword,
    getCode("user", { modifier: "" }),
    signup,
    registerUser,
    updateOne
  );

router.route("/").get(getAll);
router.route("/:id").get(getOne);

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager", "teacher")
);

router.route("/").post(getCode(name), createOne);
router.route("/:id").patch(checkRole, updateOne).delete(makeDeleted, updateOne);

router
  .route("/:id/register")
  .patch(registerUser, updateOne)
  .delete(unregisterUser, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(deleteOne);

module.exports = router;
