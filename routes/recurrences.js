const express = require("express");
const {
  getRecurrence,
  createRecurrence,
  getRecurrences,
  updateRecurrence,
  makeDeletedRecurrence,
  deleteRecurrence,
  executeRecurrence,
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
const { populate, archive } = require("../utils/helpers");

const router = express.Router();

scheduleRecurrenceNotifications();

router.use(protect);

router
  .route("/")
  .get(populate("executionCount"), getRecurrences)
  .post(createRecurrence);

router
  .route("/:id")
  .get(
    populate([
      { path: "category", select: "title" },
      { path: "branch", select: "name" },
      { path: "releatedTo", select: "name surname patronymic code" },
    ]),
    getRecurrence
  )
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

router.route("/:id/archive").get(archive, updateRecurrence);
router.route("/:id/unarchive").get(archive, updateRecurrence);
router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), deleteRecurrence);

module.exports = router;
