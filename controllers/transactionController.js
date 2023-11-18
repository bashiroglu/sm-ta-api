const mongoose = require("mongoose");

const factory = require("./helpers/handlerFactory");
const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const TransactionModel = require("../models/transactionModel");
const BranchModel = require("../models/branchModel");
const LowerCategory = require("../models/lowerCategoryModel");

exports.getTransactions = factory.getAll(TransactionModel);
exports.getTransaction = factory.getOne(TransactionModel);
exports.createTransaction = factory.createOne(TransactionModel);
exports.updateTransaction = factory.updateOne(TransactionModel);
exports.makeDeletedTransaction = factory.makeDeletedOne(TransactionModel);
exports.deleteTransaction = factory.deleteOne(TransactionModel);

exports.updateBalance = catchAsync(async (req, res, next) => {
  const { session } = req;

  let { amount, isIncome, branch: branchId, category } = req.body;
  amount = amount * (isIncome || -1);
  const branch = await BranchModel.findByIdAndUpdate(
    branchId,
    { $inc: { balance: amount } },
    { session }
  );

  if (!branch) {
    await session.abortTransaction();
    return next(new AppError("branch_not_found", 404));
  }

  const lower = await LowerCategory.findByIdAndUpdate(
    category,
    { $inc: { priority: 1 } },
    { session }
  );

  if (!lower) {
    await session.abortTransaction();
    return next(new AppError("Category not found with that ID", 404));
  }

  req.body = {
    ...req.body,
    amount,
    balanceBefore: branch.balance,
    balanceAfter: branch.balance + amount,
  };

  next();
});

exports.checkBranch = catchAsync(async (req, res, next) => {
  const { session } = req;
  if (!req.user.roles.includes("owner"))
    if (
      req.user.roles.includes("manager") &&
      !req.user.branches?.map((b) => b.id).includes(req.body.branch)
    ) {
      if (session) await session.abortTransaction();
      return next(new AppError("not_authorized.", 401));
    }

  next();
});
