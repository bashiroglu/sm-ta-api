const catchAsync = require("../utils/catchAsync");
const Model = require("../models/transactionModel");
const AppError = require("../utils/appError");
const { getCode } = require("../utils/helpers");
const { incrementPriority } = require("./lowerCategoryController");
const { updateBalance } = require("./branchController");
const { handleStudentPayment } = require("./enrollmentController");

const prepareTransaction = catchAsync(async (req, res, next) => {
  const lower = await incrementPriority(req);
  if (!lower) return next(new AppError("category_not_found", 404));
  if (req.body.internal) return next();
  const enrollment = await handleStudentPayment(req);
  if (!enrollment) return next(new AppError("student_not_found", 404));
  const balance = await updateBalance(req);
  if (!balance) return next(new AppError("branch_not_found", 404));
  next();
});

const restrictHiddenTransactions = (req, res, next) => {
  const permissions = req.user.permissions.map((p) => p.slug);
  if (!permissions.includes("see-hidden-transaction")) req.query.hidden = false;
  next();
};

const createTransactionOnLessonCreate = catchAsync(async (req, res, next) => {
  if (req.body.isExtra) return next();
  const { transactionBody, lessonBody, session } = req;
  const code = await getCode(Model, session);
  await Model.create([{ code, ...transactionBody }], { session });
  req.body = lessonBody;
  next();
});

module.exports = {
  prepareTransaction,
  restrictHiddenTransactions,
  createTransactionOnLessonCreate,
};
