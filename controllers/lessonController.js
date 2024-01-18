const catchAsync = require("../utils/catchAsync");
const GroupModel = require("../models/groupModel");
const EnrollmentModel = require("../models/enrollmentModel");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");

const prepareLesson = catchAsync(async (req, res, next) => {
  const {
    session,
    params: { id },
    body: { absent, present, isExtra },
    user: { id: userId },
  } = req;

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
    status: "active",
  }).session(session);
  if (!enrollments.length)
    return next(new AppError("enrollments_not_faund", 404));

  const paidStudents = [];

  enrollments.forEach(async (studentObj) => {
    const { lessonCount, permissionCount, status, student } = studentObj;
    const isActive = status === "active";
    const isPresent = present.includes(String(student));
    const isAbsent = absent.includes(String(student));
    const hasPermission = permissionCount;
    if (isActive) {
      if (isPresent || !hasPermission) {
        if (lessonCount) studentObj.lessonCount -= 1;
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
        studentObj.permissionCount = 0;
      }
      await studentObj.save({ session });
    }
  });

  const teacherProgram = group.teacher.earnings.find(
    (earning) => String(earning.program) === String(program.id)
  );

  if (!teacherProgram)
    return next(new AppError("teacher_program_not_found", 404));

  const totalIncome = teacherProgram.amount * paidStudents.length;

  const teacher = await UserModel.findByIdAndUpdate(String(group.teacher.id), {
    $inc: { balance: totalIncome },
  }).session(session);
  if (!teacher) return next(new AppError("doc_not_found", 404));

  req.transactionBody = {
    title: req.body.code,
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

  req.lessonBody = { ...req.body, studentState: enrollments };

  next();
});

module.exports = { prepareLesson };
