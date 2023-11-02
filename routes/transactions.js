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
const { populate } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(protect, restrictTo("roles", "owner", "admin", "manager"));

router
  .route("/")
  .get(populate({ path: "createdBy", select: "name surname" }), getTransactions)
  .post(
    checkBranch,
    getCode("transaction"),
    changeBalanceCreateTransaction,
    createTransaction
  );
router
  .route("/:id")
  .get(getTransaction)
  .patch(updateTransaction)
  .delete(makeDeletedTransaction);
router.route("/:id/delete").delete(deleteTransaction);

module.exports = router;
