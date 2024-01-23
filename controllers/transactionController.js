const catchAsync = require("../utils/catchAsync");
const Model = require("../models/transactionModel");
const AppError = require("../utils/appError");
const { getCode } = require("../utils/helpers");
const { incrementPriority } = require("./lowerCategoryController");
const { updateBalance } = require("./branchController");
const { handleStudentPayment } = require("./enrollmentController");
const { handleSalary } = require("./userController");

const handleByCategory = async (req) => {
  let { category, smsNotification } = req.body;
  const { STUDENT_PAYMENT_CATEGORY_ID, SALARY_CATEGORY_ID } = process.env;
  let result = {};
  Model.schema.statics.smsNotification = smsNotification;
  if (category === STUDENT_PAYMENT_CATEGORY_ID)
    result = await handleStudentPayment(req);
  if (category === SALARY_CATEGORY_ID) result = await handleSalary(req);
  return result;
};

const prepareTransaction = catchAsync(async (req, res, next) => {
  let result = await incrementPriority(req);
  if (result.message) return next(new AppError(message, 404));
  if (req.body.internal) return next();
  result = await handleByCategory(req);
  if (result.message) return next(new AppError(message, 404));
  result = await updateBalance(req);
  if (result.message) return next(new AppError(message, 404));

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
