const express = require("express");
const Model = require("../models/transactionModel");
const { getAll, createOne, getOne, updateOne, deleteOne } =
  require("./helpers/handlerFactory")(Model);

const {
  updateBalance,
  checkBranch,
  restrictHiddenTransactions,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "admin", "manager"),
  restrictHiddenTransactions
);

router
  .route("/")
  .get(populate({ path: "createdBy", select: "name surname" }), getAll)
  .post(checkBranch, getCode("transaction"), updateBalance, createOne);

router.route("/:id").get(
  populate([
    { path: "branch", select: "name -managers" },
    { path: "relatedTo", select: "name surname" },
    { path: "createdBy", select: "name surname" },
  ]),
  getOne
);

module.exports = router;
