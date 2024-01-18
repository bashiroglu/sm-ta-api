const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const GroupModel = require("../models/groupModel");
const EnrollmentModel = require("../models/enrollmentModel");
const UserModel = require("../models/userModel");
const Model = require("../models/lessonModel");
const AppError = require("../utils/appError");
const { startTransSession, getCode } = require("../utils/helpers");

const prepareLesson = catchAsync(async (req, res, next) => {
  const {
    params: { id },
    body: { absent, present, isExtra },
    user: { id: userId },
  } = req;
  const session = await startTransSession(req);

  if (isExtra) return next();

  const teacherId = req.body.teacherId || userId;

  const group = await GroupModel.findById(id)
    .populate(["teacher", "program"])
    .session(session);

  if (!group) return next(new AppError("group_not_found", 404));

  if (String(group.teacher.id) !== String(teacherId))
    return next(new AppError("group_teacher_is_other_user", 404));
  const { program } = group;
  const enrollments = await EnrollmentModel.find({
    group: id,
  }).session(session);
  if (!enrollments.length)
    return next(new AppError("enrollments_not_faund", 404));

  const paidStudents = [];

  const _id = mongoose.Types.ObjectId();

  enrollments.forEach(async (enrollment) => {
    const { lessonCount, permissionCount, status, student } = enrollment;

    const isActive = status === "active";
    const isPresent = present.includes(String(student));
    const isAbsent = absent.includes(String(student));
    const hasPermission = permissionCount;
    if (isActive) {
      if (isPresent || !hasPermission) {
        if (lessonCount) enrollment.lessonCount -= 1;
        if (lessonCount === 1 && program.monthly) {
          // TODO: send sms
          console.warn(
            `Salam, deyerli telebemiz!

Balansinizda cemi 1 ders qalib.

Derslere davam etmek ucun, zehmet olmasa, balansinizi artirin. Eks halda sisteme girisiniz ve ev tapsiriqlarini gormeyiniz mumkun olmayacaq.

Davam etmeyeceksinizse, sistemin borc hesablamamasi ucun bizi melumatlandirmaginizi xahis edirik.`
          );
        }
        paidStudents.push(student);
      }
      if (isAbsent) {
        if (!hasPermission) paidStudents.push(student);
        enrollment.permissionCount = 0;
      }
    }
    enrollment.history = [
      ...enrollment.history,
      {
        lesson: _id,
        status: isActive ? "active" : "inactive",
        lessonCount: enrollment.lessonCount,
        permissionCount: enrollment.permissionCount,
      },
    ];
    await enrollment.save({ session });
  });

  const teacherProg = group.teacher.earnings.find(
    (earning) => String(earning.program) === String(program.id)
  );

  if (!teacherProg) return next(new AppError("teacher_program_not_found", 404));
  const totalIncome = teacherProg.amount * paidStudents.length;
  const teacher = await UserModel.findByIdAndUpdate(String(group.teacher.id), {
    $inc: { balance: totalIncome },
  }).session(session);
  if (!teacher) return next(new AppError("doc_not_found", 404));

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
  };

  req.lessonBody = { ...req.body, _id, code };

  next();
});

module.exports = { prepareLesson };
