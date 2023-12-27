const express = require("express");
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  makeDeletedTransaction,
  deleteTransaction,
  updateBalance,
  checkBranch,
  restrictHiddenTransactions,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager"),
  restrictHiddenTransactions
);

router
  .route("/")
  .get(populate({ path: "createdBy", select: "name surname" }), getTransactions)
  .post(checkBranch, getCode("transaction"), updateBalance, createTransaction);
router
  .route("/:id")
  .get(
    populate([
      { path: "branch", select: "name -managers" },
      { path: "relatedTo", select: "name surname" },
      { path: "createdBy", select: "name surname" },
    ]),
    getTransaction
  )
  .patch(updateTransaction)
  .delete(makeDeleted, updateTransaction);

router.route("/:id/archive").get(archive, updateTransaction);
router.route("/:id/unarchive").get(archive, updateTransaction);
router
  .route("/:id/delete")
  .delete(restrictTo("roles", "admin"), deleteTransaction);

module.exports = router;
