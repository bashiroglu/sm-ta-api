const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  archiveTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, restrictTo("owner", "admin"));

router.route("/").get(getTransactions).post(createTransaction);
router
  .route("/:id")
  .get(getTransaction)
  .patch(updateTransaction)
  .delete(deleteTransaction);
router.route("/:id/archive").patch(archiveTransaction);

module.exports = router;
