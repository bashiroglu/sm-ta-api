const express = require("express");
const Model = require("../../models/userModel");
const handlerFactory = require("../../utils/handlerFactory");

const {
  createUserByRole,
  getAllByRole,
  setPassword,
  setReqBody,
  activateUser,
  deactivateUser,
  scheduleBirthdayNotifications,
  aliasTinyStudent,
  checkMembership,
  checkMe,
} = require("../../controllers/userController");
const { protect, restrictTo } = require("../../controllers/authController");

const { populate, makeDeleted } = require("../../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);

const router = express.Router();

scheduleBirthdayNotifications();

router.use(protect);

router
  .route("/")
  .get(restrictTo(["admin", "manager"]), getAll)
  .post(restrictTo(["admin", "manager"]), setPassword, createOne);

// role restriction of this endpoint is in checkMe function
router
  .route("/:id")
  .get(populate({ path: "positions", select: "title id" }), checkMe, getOne)
  .patch(checkMe, updateOne)
  .delete(checkMe, checkMembership, makeDeleted, updateOne);

router.use(restrictTo(["admin", "manager"]));

router
  .route("/role/:role")
  .get(getAllByRole, getAll)
  .post(createUserByRole, setPassword, createOne);

router.route("/role/student/tiny").get(aliasTinyStudent, getAll);
router.route("/role/student/participation").get(
  getAllByRole,
  populate([
    { path: "absents", select: "group" },
    { path: "presents", select: "_id group" },
  ]),
  getAll
);

router.route("/role/student/:id/participation").get(
  populate([
    { path: "absents", select: "group" },
    { path: "presents", select: "_id group" },
  ]),
  getOne
);

router.route("/:id/tags").get(setReqBody, getOne).patch(setReqBody, updateOne);
router
  .route("/:id/permissions")
  .get(setReqBody, getOne)
  .patch(setReqBody, updateOne);

router.route("/:id/activate").patch(activateUser, updateOne);
router
  .route("/:id/deactivate")
  .patch(checkMembership, deactivateUser, updateOne);

module.exports = router;
