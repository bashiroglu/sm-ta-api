const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  archiveTransaction,
  deleteTransaction,
  changeBalanceCreateTransaction,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin"));

router
  .route("/")
  .get(getTransactions)
  .post(changeBalanceCreateTransaction, createTransaction);
router
  .route("/:id")
  .get(getTransaction)
  .patch(updateTransaction)
  .delete(deleteTransaction);
router.route("/:id/archive").patch(archiveTransaction);

module.exports = router;
