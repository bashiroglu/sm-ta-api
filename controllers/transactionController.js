const mongoose = require("mongoose");

const factory = require("./helpers/handlerFactory");
const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const TransactionModel = require("../models/transactionModel");
const BranchModel = require("../models/branchModel");
const LowerCategory = require("../models/lowerCategoryModel");
const { roles } = require("../utils/constants/enums");

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
    return next(new AppError("branch_not_found", 404));
  }

  const lower = await LowerCategory.findByIdAndUpdate(
    category,
    { $inc: { priority: 1 } },
    { session }
  );

  if (!lower) {
    return next(new AppError("category_not_found", 404));
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
  let {
    user: { roles: userRoles, branches },
    body: { branch },
  } = req;

  const session = req.session || (await mongoose.startSession());
  if (!req.session) session.startTransaction();

  const isOwner = userRoles.includes(roles.OWNER);
  const isAdmin = userRoles.includes(roles.ADMIN);

  console.log(isOwner);

  if (!(isOwner || isAdmin)) {
    const isManager = userRoles.includes(roles.MANAGER);
    if (!isManager) return next(new AppError("not_authorized", 401));

    const notOwnBranch = !branches?.map((b) => b.id).includes(branch);

    if (isManager && notOwnBranch)
      return next(new AppError("not_authorized", 401));
  }
  next();
});

exports.restrictHiddenTransactions = catchAsync(async (req, res, next) => {
  const permissions = req.user.permissions.map((p) => p.slug);
  if (!permissions.includes("see-hidden-transaction")) req.query.hidden = false;

  next();
});
