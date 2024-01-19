const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Model = require("../models/transactionModel");
const RecurrenceModel = require("../models/recurrenceModel");
const EnrollmentModel = require("../models/enrollmentModel");
const BranchModel = require("../models/branchModel");
const GroupModel = require("../models/groupModel");
const LowerCategory = require("../models/lowerCategoryModel");
const { roles } = require("../utils/constants/enums");
const { getCode } = require("../utils/helpers");

const updateBalance = catchAsync(async (req, res, next) => {
  let {
    body: {
      amount,
      isIncome,
      branch: branchId,
      category,
      internal,
      relatedTo,
      lessonCount,
      permissionCount,
      notifyWithSms,
    },
    session,
  } = req;

  const lower = await LowerCategory.findByIdAndUpdate(category, {
    $inc: { priority: 1 },
  }).session(session);

  if (!lower) return next(new AppError("category_not_found", 404));

  if (internal) return next();

  if (category === process.env.STUDENT_PAYMENT_CATEGORY_ID) {
    const {
      program: {
        lessonCount: progLessonCount,
        permissionCount: progPermissionCount,
      },
    } = await GroupModel.findById(groupId).populate("program").session(session);

    const enrollment = await EnrollmentModel.findOneAndUpdate(
      {
        student: relatedTo,
        group: groupId,
      },
      {
        $inc: { lessonCount: lessonCount || progLessonCount },
        permissionCount: permissionCount || progPermissionCount,
      }
    ).session(session);

    if (!enrollment) return next(new AppError("student_not_found", 404));
    // TODO: Apply notify student abount payment
    if (notifyWithSms) console.warn("Your payment has been fulfilled");
  }

  amount = amount * (isIncome || -1);
  const branch = await BranchModel.findByIdAndUpdate(
    branchId,
    { $inc: { balance: amount } },
    { session }
  );

  if (!branch) return next(new AppError("branch_not_found", 404));

  req.body.amount = amount;
  req.body.balanceBefore = branch.balance;
  req.body.balanceAfter = branch.balance + amount;

  next();
});

const checkBranch = catchAsync(async (req, res, next) => {
  let {
    params: { id },
    body: { branch },
    user: { roles: userRoles, branches },
  } = req;

  if (id) {
    const recurrence = await RecurrenceModel.findById(id);
    if (!recurrence) return next(new AppError("doc_not_found", 404));
    req.recurrence = recurrence;
  }

  const isAdmin = userRoles.includes(roles.ADMIN);

  if (!isAdmin) {
    const isManager = userRoles.includes(roles.MANAGER);
    if (!isManager) return next(new AppError("not_authorized", 401));
    const branchIds = branches?.map((b) => b.id);

    const branchId = id ? String(recurrence.branch) : branch;
    const notOwnBranch = !branchIds.includes(branchId);

    if (notOwnBranch) return next(new AppError("not_authorized", 401));
  }
  next();
});

const restrictHiddenTransactions = catchAsync(async (req, res, next) => {
  const permissions = req.user.permissions.map((p) => p.slug);
  if (!permissions.includes("see-hidden-transaction")) req.query.hidden = false;

  next();
});

const createTransactionOnLessonCreate = catchAsync(async (req, res, next) => {
  const { transactionBody, lessonBody, session } = req;
  const code = await getCode(Model, session);
  await Model.create([{ code, ...transactionBody }], { session });

  req.body = lessonBody;

  next();
});

module.exports = {
  updateBalance,
  checkBranch,
  restrictHiddenTransactions,
  createTransactionOnLessonCreate,
};
