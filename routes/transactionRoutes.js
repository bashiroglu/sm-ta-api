const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTransactions)
  .post(restrictTo("user"), createTransaction);
router
  .route("/:id")
  .get(getTransaction)
  .patch(restrictTo("user", "admin"), updateTransaction)
  .delete(restrictTo("user", "admin"), deleteTransaction);

module.exports = router;
