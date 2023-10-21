const factory = require("./helpers/handlerFactory");
const TransactionModel = require("../models/transactionModel");

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
    const { amount, isIncome } = req.body;
    const company = await CompanyModel.findById(process.env.COMPANY_ID);
    if (!company) throw Error("Company not found");

    req.body.schoolBalanceBefore = company.balance;
    company.balance += amount * (isIncome || -1);
    req.body.schoolBalanceAfter = company.balance;

    req.doc = await TransactionModel.create([req.body], { session });
    await company.save();
    await session.commitTransaction();
    session.endSession();
    next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message));
  }
});
