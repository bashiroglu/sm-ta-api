const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const GroupModel = require("../models/groupModel");
const Model = require("../models/lessonModel");
const AppError = require("../utils/appError");
const { startTransSession, getCode } = require("../utils/helpers");

const prepareLesson = catchAsync(async (req, res, next) => {
  const session = await startTransSession(req);
  const { isExtra, absent, present, group: groupId } = req.body;

  if (isExtra) return next();
  const teacherId = req.body.teacher || req.user.id;

  const group = await GroupModel.findById(groupId)
    .populate([
      "teacher",
      "program",
      "branch",
      {
        path: "enrollments",
        populate: ["student", { path: "group", populate: "program" }],
      },
    ])
    .session(session);
  if (!group) return next(new AppError("group_not_found", 404));

  const { teacher, program, enrollments } = group;

  if (!teacher) return next(new AppError("teacher_not_found", 404));
  if (!program) return next(new AppError("program_not_found", 404));
  if (!enrollments?.length)
    return next(new AppError("enrollment_not_found", 404));
  if (String(teacher.id) !== String(teacherId))
    return next(new AppError("group_teacher_is_other_user", 404));

  const _id = mongoose.Types.ObjectId();
  let paidStudents = [];

  enrollments.forEach(async (enrollment) => {
    let { permissionCount, status, student } = enrollment;
    if (status === "active") {
      const isPresent = present.includes(student.id);
      const isAbsent = absent.includes(student.id);
      const hasPermission = !!permissionCount;
      if (isPresent || (isAbsent && !hasPermission)) {
        enrollment.lessonCount -= 1;
        paidStudents.push(student.id);
        status = isPresent ? "present" : "absent";
      }
      if (isAbsent && hasPermission) {
        status = "permission";
        enrollment.permissionCount = 0;
      }
    }
    enrollment.history = [
      ...enrollment.history,
      {
        lesson: _id,
        status,
        lessonCount: enrollment.lessonCount,
        permissionCount: enrollment.permissionCount,
      },
    ];
    enrollment.save({ session });
  });

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
    category: process.env.LESSON_CREATE_CATEGORY_ID,
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

const getGroupLessons = catchAsync(async (req, res, next) => {
  const lessons = await Model.find({ group: req.params.id }).select(
    "id createdAt topic teacher"
  );
  req.resObj.lessons = lessons;
  req.resObj.students = req.resObj.data;
  delete req.resObj.data;

  next();
});

module.exports = { prepareLesson, getGroupLessons };
