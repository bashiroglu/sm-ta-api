const express = require("express");
const {
  getRecurrence,
  createRecurrence,
  getRecurrences,
  updateRecurrence,
  makeDeletedRecurrence,
  deleteRecurrence,
  executeRecurrence,
  prepareRecurrences,
  scheduleRecurrenceNotifications,
} = require("../controllers/recurrenceController");
const {
  updateBalance,
  createTransaction,
  checkBranch,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const getCode = require("../utils/getCode");
const cron = require("node-cron");

const router = express.Router();

scheduleRecurrenceNotifications();

router.use(protect);

router
  .route("/")
  .get(prepareRecurrences, getRecurrences)
  .post(createRecurrence);

router
  .route("/:id")
  .get(getRecurrence)
  .patch(updateRecurrence)
  .delete(makeDeletedRecurrence);
router
  .route("/:id/execute")
  .post(
    checkBranch,
    getCode("transaction"),
    executeRecurrence,
    updateBalance,
    createTransaction
  );
router.route("/:id/delete").delete(deleteRecurrence);

module.exports = router;
