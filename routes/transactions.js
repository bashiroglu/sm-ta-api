const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  makeDeletedTransaction,
  deleteTransaction,
  changeBalanceCreateTransaction,
  checkBranch,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin"));

router
  .route("/")
  .get(getTransactions)
  .post(checkBranch, changeBalanceCreateTransaction, createTransaction);
router
  .route("/:id")
  .get(getTransaction)
  .patch(updateTransaction)
  .delete(deleteTransaction);
router.route("/:id/delete").delete(deleteTransaction);

module.exports = router;
