const express = require("express");
const Model = require("../../models/recurrenceModel");
const handlerFactory = require("../../utils/handlerFactory");
const TransactionModel = require("../../models/transactionModel");
const {
  executeRecurrence,
  scheduleRecurrenceNotifications,
  setReqRecurrence,
} = require("../../controllers/recurrenceController");
const {
  prepareTransaction,
} = require("../../controllers/transactionController");
const { protect, restrictTo } = require("../../controllers/authController");

const { populate, makeDeleted } = require("../../utils/helpers");
const { checkBranch } = require("../../controllers/branchController");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);
const { createOne: createTransaction } = handlerFactory(TransactionModel);

const router = express.Router();

scheduleRecurrenceNotifications();

router.use(protect, restrictTo(["admin", "manager"]));

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
    setReqRecurrence,
    checkBranch,
    executeRecurrence,
    prepareTransaction,
    createTransaction
  );

module.exports = router;
