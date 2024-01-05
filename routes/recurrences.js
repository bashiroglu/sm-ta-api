const express = require("express");
const Model = require("../models/recurrenceModel");
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);
const TransactionModel = require("../models/transactionModel");
const { createOne: createTransaction } = require("./helpers/handlerFactory")(
  TransactionModel
);
const {
  executeRecurrence,
  scheduleRecurrenceNotifications,
} = require("../controllers/recurrenceController");
const {
  updateBalance,
  checkBranch,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted } = require("../utils/helpers");

const router = express.Router();

scheduleRecurrenceNotifications();

router.use(protect);

router.route("/").get(populate("executionCount"), getAll).post(createOne);

router
  .route("/:id")
  .get(
    populate([
      { path: "category", select: "title" },
      { path: "branch", select: "name" },
      { path: "releatedTo", select: "name surname patronymic code" },
    ]),
    getOne
  )
  .patch(updateOne)
  .delete(makeDeleted, updateOne);
router
  .route("/:id/execute")
  .post(
    checkBranch,
    getCode("transaction"),
    executeRecurrence,
    updateBalance,
    createTransaction
  );

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
