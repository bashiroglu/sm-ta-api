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
exports.archiveTransaction = factory.archiveOne(TransactionModel);
exports.deleteTransaction = factory.deleteOne(TransactionModel);

exports.changeBalanceCreateTransaction = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { amount, isIncome, branch: branchId, category } = req.body;
    amount = amount * (isIncome || -1);
    const branch = await BranchModel.findByIdAndUpdate(
      branchId,
      { $inc: { balance: amount } },
      { session }
    );
    await LowerCategory.findByIdAndUpdate(
      category,
      { $inc: { priority: 1 } },
      { session }
    );

    console.log(branch);

    const transactionData = {
      ...req.body,
      branchBalanceBefore: branch.balance,
      branchBalanceAfter: branch.balance + amount,
    };

    req.doc = await TransactionModel.create([transactionData], { session });
    await session.commitTransaction();
    session.endSession();
    next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message));
  }
});
