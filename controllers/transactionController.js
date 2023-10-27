const factory = require("./helpers/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const TransactionModel = require("../models/transactionModel");
const BranchModel = require("../models/branchModel");
const LowerCategory = require("../models/lowerCategoryModel");

exports.getTransactions = factory.getAll(TransactionModel);
exports.getTransaction = factory.getOne(TransactionModel);
exports.createTransaction = factory.createOne(TransactionModel);
exports.updateTransaction = factory.updateOne(TransactionModel);
exports.makeDeletedTransaction = factory.makeDeletedOne(TransactionModel);
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

exports.checkBranch = catchAsync(async (req, res, next) => {
  if (!req.user.roles.includes("owner"))
    if (
      req.user.roles.includes("manager") &&
      !req.user.branches?.map((b) => b.id).includes(req.body.branch)
    )
      return next(
        new AppError("You are not authorized to finish this action.", 401)
      );

  next();
});
