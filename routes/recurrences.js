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
const getCode = require("../utils/getCode");
const { populate, archive, makeDeleted, sendRes } = require("../utils/helpers");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);
const { createOne: createTransaction } = handlerFactory(TransactionModel);

const router = express.Router();

scheduleRecurrenceNotifications();

router.use(protect);

router
  .route("/")
  .get(populate("executionCount"), getAll, sendRes)
  .post(createOne, sendRes);

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
  .patch(updateOne, sendRes)
  .delete(makeDeleted, updateOne, sendRes);
router
  .route("/:id/execute")
  .post(
    checkBranch,
    getCode("transaction"),
    executeRecurrence,
    updateBalance,
    createTransaction
  );

router.route("/:id/archive").get(archive, updateOne, sendRes);
router.route("/:id/unarchive").get(archive, updateOne, sendRes);
router.route("/:id/delete").delete(restrictTo(["admin"]), deleteOne, sendRes);

module.exports = router;
