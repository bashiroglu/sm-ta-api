const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const GroupModel = require("../models/groupModel");
const Model = require("../models/lessonModel");
const AppError = require("../utils/appError");
const { startTransSession, getCode } = require("../utils/helpers");
const { adjustEnrollments } = require("./enrollmentController");

const prepareLesson = catchAsync(async (req, res, next) => {
  const session = await startTransSession(req);

  if (req.body.isExtra) return next();

  const teacherId = req.body.teacher || req.user.id;

  const group = await GroupModel.findById(req.body.group)
    .populate(["teacher", "program", "branch"])
    .session(session);
  if (!group) return next(new AppError("group_not_found", 404));

  const { teacher, program } = group;
  if (!teacher) return next(new AppError("teacher_not_found", 404));
  if (!program) return next(new AppError("program_not_found", 404));

  if (String(teacher.id) !== String(teacherId))
    return next(new AppError("group_teacher_is_other_user", 404));

  const _id = mongoose.Types.ObjectId();
  const { error, paidStudents } = await adjustEnrollments(
    req,
    group,
    _id,
    session
  );
  if (error) return next(new AppError(result.message, 404));

  const teacherProg = teacher.earnings.find(
    (e) => String(e.program) === String(program.id)
  );
  if (!teacherProg) return next(new AppError("teacher_program_not_found", 404));

  const totalIncome = teacherProg.amount * paidStudents.length;
  teacher.balance += totalIncome;
  await teacher.save({ session, validateBeforeSave: false });

  const code = await getCode(Model, session);
  req.transactionBody = {
    title: code,
    amount: totalIncome,
    description: "",
    category: process.env.LESSON_CREATE_CATEGORY,
    isIncome: false,
    realDate: new Date(),
    paymentMethod: "online",
    branch: group.branch,
    relatedTo: teacherId,
    internal: true,
    paidStudents,
    balanceBefore: group.branch.balance,
    balanceAfter: group.branch.balance,
    relatedToBalanceAfter: teacher.balance - totalIncome,
    relatedToBalanceBefore: teacher.balance,
  };

  req.lessonBody = { ...req.body, _id, code };

  next();
});

module.exports = { prepareLesson };
