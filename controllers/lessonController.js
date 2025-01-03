const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const GroupModel = require("../models/groupModel");
const Model = require("../models/lessonModel");
const HomeworkModel = require("../models/homeworkModel");
const HomeworkTaskModel = require("../models/homeworkTaskModel");
const AppError = require("../utils/appError");
const { startTransSession, getCode } = require("../utils/helpers");

const prepareLesson = catchAsync(async (req, res, next) => {
  // start session
  const session = await startTransSession(req);
  // destruct body
  const { isExtra, participations, group: groupId } = req.body;

  // Find, check existence, populate and destruct group,
  // and chek destructed items
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

  // Check if teacher in body or creating is the teacher of the group
  const teacherId = req.body.teacher || req.user.id;
  if (String(teacher.id) !== String(teacherId))
    return next(new AppError("group_teacher_is_other_user", 404));

  // Declare ID for lesson and array to store reconned students
  const _id = mongoose.Types.ObjectId();
  let paidStudents = [];

  enrollments.forEach(async (enrollment) => {
    // destruct needed enrollment document fields
    let {
      permissionCount,
      status,
      student: { id },
    } = enrollment;
    // Find student from participations and destruct
    const { absent, latency } =
      participations?.find(({ student }) => `${student}` === `${id}`) ?? {};

    if (status === "active") {
      if (isExtra) {
        status = absent ? "absent" : "present";
      } else if (absent) {
        if (permissionCount) {
          enrollment.permissionCount = 0;
          status = "permission";
        } else {
          enrollment.lessonCount -= 1;
          paidStudents.push(id);
          status = "absent";
        }
      } else {
        enrollment.lessonCount -= 1;
        paidStudents.push(id);
        status = "present";
      }
    }
    enrollment.history = [
      ...enrollment.history,
      {
        lesson: _id,
        isExtra,
        lessonCount: enrollment.lessonCount,
        permissionCount: enrollment.permissionCount,
        status,
        latency,
      },
    ];
    enrollment.save({ session });
  });

  const code = await getCode(Model, session);
  req.lessonBody = { ...req.body, _id, code };

  if (isExtra) return next();

  const { earnings } = teacher;
  if (!earnings || !earnings.length)
    return next(new AppError("earnings_not_found", 404));
  const teacherProg = earnings?.find((e) => `${e.program}` === `${program.id}`);
  if (!teacherProg) return next(new AppError("teacher_program_not_found", 404));
  const totalIncome = teacherProg.amount * paidStudents.length;
  teacher.balance += totalIncome;
  await teacher.save({ session, validateBeforeSave: false });

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

  next();
});

const getGroupLessons = catchAsync(async (req, res, next) => {
  const lessons = await Model.find({ group: req.params.id })
    .populate({ path: "homeworks", populate: "tasks" })
    .select("id createdAt topic teacher");
  req.resObj.lessons = lessons;
  req.resObj.students = req.resObj.data;
  delete req.resObj.data;

  next();
});

const addHomeworks = catchAsync(async (req, res, next) => {
  let {
    params: { id },
    body: { exercises },
    user,
  } = req;

  if (!exercises?.length) return next(new AppError("empty_body", 400));
  const session = await startTransSession(req);

  const lesson = await Model.findById(id).session(session);
  if (!lesson) return next(new AppError("lesson_not_found", 404));

  const { participations, teacher } = lesson;
  if (`${teacher}` !== `${user.id}`)
    return next(new AppError("not_lesson_teacher", 404));
  if (!participations?.length)
    return next(new AppError("participations_not_found", 404));

  let homeworkTasks = [];
  const homeworks = participations.map((participation) => {
    const { student } = participation;
    if (!student) return next(new AppError("student_not_found", 404));
    const _id = mongoose.Types.ObjectId();
    const tasks = exercises.map((e) => ({ ...e, homework: _id }));
    homeworkTasks = [...homeworkTasks, ...tasks];

    return {
      _id,
      lesson: id,
      student,
    };
  });

  await HomeworkModel.create(homeworks, { session });
  await HomeworkTaskModel.create(homeworkTasks, { session });
  req.body = { exercises };

  next();
});

const checkTeacherLesson = catchAsync(async (req, res, next) => {
  if (!req.isTeachers) return next();
  const {
    user,
    params: { id },
  } = req;

  await user.populate("lessons").execPopulate();
  const lessons = user.lessons.map((l) => "" + l.id);
  if (!lessons.includes(id)) return next(new AppError("doc_not_found", 404));

  next();
});

module.exports = {
  prepareLesson,
  getGroupLessons,
  addHomeworks,
  checkTeacherLesson,
};
