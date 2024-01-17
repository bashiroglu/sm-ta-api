const express = require("express");
const name = "conversation";
const Model = require(`../models/${name}Model`);
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
const { archive, makeDeleted, sendRes } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

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

router.route("/").get(getAll, sendRes);
router.route("/:id").get(getOne, sendRes);

router.use(protect, restrictTo(["owner", "admin", "manager", "teacher"]));

router.route("/").post(getCode(name), createOne, sendRes);
router
  .route("/:id")
  .patch(checkRole, updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);

router
  .route("/:id/register")
  .patch(registerUser, updateOne, sendRes)
  .delete(unregisterUser, updateOne, sendRes);

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(deleteOne, sendRes);

module.exports = router;
