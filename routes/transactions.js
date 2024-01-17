const express = require("express");
const Model = require("../models/transactionModel");
const handlerFactory = require("./helpers/handlerFactory");
const {
  updateBalance,
  checkBranch,
  restrictHiddenTransactions,
} = require("../controllers/transactionController");
const { protect, restrictTo } = require("../controllers/authController");
const { populate, archive, makeDeleted } = require("../utils/helpers");
const getCode = require("../utils/getCode");

const { getAll, createOne, getOne, updateOne, deleteOne } =
  handlerFactory(Model);

const router = express.Router();

router.use(
  protect,
  restrictTo("roles", "owner", "admin", "manager"),
  restrictHiddenTransactions
);

router
  .route("/")
  .get(populate({ path: "createdBy", select: "name surname" }), getAll)
  .post(checkBranch, getCode("transaction"), updateBalance, createOne);
router
  .route("/:id")
  .get(
    populate([
      { path: "branch", select: "name -managers" },
      { path: "relatedTo", select: "name surname" },
      { path: "createdBy", select: "name surname" },
    ]),
    getOne
  )
  .patch(updateOne)
  .delete(makeDeleted, updateOne);

router.route("/:id/archive").get(archive, updateOne);
router.route("/:id/unarchive").get(archive, updateOne);
router.route("/:id/delete").delete(restrictTo("roles", "admin"), deleteOne);

module.exports = router;
