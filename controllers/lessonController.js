const factory = require("./helpers/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const LessonModel = require("../models/lessonModel");
const GroupModel = require("../models/groupModel");
const UserModel = require("../models/userModel");

exports.getLessons = factory.getAll(LessonModel);
exports.getLesson = factory.getOne(LessonModel);
exports.createLesson = factory.createOne(LessonModel);
exports.updateLesson = factory.updateOne(LessonModel);
exports.deleteLesson = factory.deleteOne(LessonModel);

exports.prepareLesson = catchAsync(async (req, res, next) => {
  const {
    session,
    body: { teacher: teacherId, group: groupId, absent, present, isExtra },
  } = req;
  if (isExtra) return next();

  const group = await GroupModel.findById(groupId).session(session);
  if (String(group.teacher) !== teacherId) {
    // TODO: add error handler
  }
  const { program, students } = group;

  const paidStudents = [];

  students.forEach(({ lessonCount, permissionCount, status, student }) => {
    const isActive = status !== "active";
    const isPresent = present.includes(student);
    const isAbsent = absent.includes(student);
    const hasPermission = permissionCount;

    if (isActive) {
      if (isPresent || !hasPermission) {
        if (lessonCount) lessonCount -= 1;
        if (lessonCount === 1 && program.monthly) {
          // TODO: send sms
          console.log(
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
        permissionCount = 0;
      }
    }
  });

  await group.save({ session: session });

  const teacher = await UserModel.findById(teacherId).session(session);
  // TODO: add error handler

  const amount = teacher.earnings.find(
    (earning) => earning.program === program
  )?.amount;

  const newAmount = amount * paidStudents.length;

  teacher.balance += newAmount;
  await teacher.save({ session: session });

  req.transactionBody = {
    title: req.body.code,
    amount: newAmount,
    description: "",
    category: "656a0db22adbf90014f3ebd3",
    isIncome: false,
    realDate: new Date(),
    paymentMethod: "online",
    hidden: false,
    branch: group.branch,
    relatedTo: teacherId,
    internal: true,
    paidStudents,
  };

  req.lessonBody = { ...req.body, studentState: students };

  next();
});
