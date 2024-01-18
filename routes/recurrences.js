const express = require("express");
const Model = require("../models/recurrenceModel");
const handlerFactory = require("./helpers/handlerFactory");
const TransactionModel = require("../models/transactionModel");
const {
  executeRecurrence,
  scheduleRecurrenceNotifications,
} = require("../controllers/recurrenceController");
const {
  updateBalance,
  checkBranch,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");

const { populate, archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne } = handlerFactory(Model);
const { createOne: createTransaction } = handlerFactory(TransactionModel);

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
  .post(checkBranch, executeRecurrence, updateBalance, createTransaction);

module.exports = router;
