const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getTeacherStudents = async (req) => {
  await req.user
    .populate({ path: "teacherGroups", populate: "enrollments" })
    .execPopulate();
  const students = req.user.teacherGroups.reduce(
    (_, cur) => [...(cur.enrollments.map((e) => `${e.student}`) || [])],
    []
  );
  return students;
};

exports.getStudents = catchAsync(async (req, res, next) => {
  const students = await getTeacherStudents(req);
  req.query._id = { $in: students };
  req.query.fields = "name surname code profileImage";

  next();
});

exports.getStudent = catchAsync(async (req, res, next) => {
  const students = await getTeacherStudents(req);
  if (!students?.includes(req.params.id))
    return next(new AppError("doc_not_found", 404));

  req.query.fields = "name surname code profileImage";
  next();
});

exports.chekGroups = catchAsync(async (req, res, next) => {
  if (req.params.id) {
    await req.user.populate("teacherGroups").execPopulate();
    const groups = req.user.teacherGroups.map((g) => "" + g.id);
    if (!groups.includes(req.params.id)) {
      return next(new AppError("doc_not_found", 404));
    }
  }

  req.query.teacher = req.user.id;
  req.popOptions = [{ path: "room", select: "name" }];
  next();
});

exports.checkTransactions = catchAsync(async (req, res, next) => {
  await req.user.populate("transactions").execPopulate();
  const transactions = req.user.transactions.map((t) => "" + t.id);

  if (req.params.id && !transactions.includes(req.params.id))
    return next(new AppError("doc_not_found", 404));

  req.query.fields = "-balanceAfter -balanceBefore";
  req.query._id = { $in: transactions };

  next();
});

exports.directLessons = (req, res, next) => {
  const {
    params: { groupId },
    user: { id: teacherId },
    method,
  } = req;

  if (method === "POST") {
    req.body.group = groupId;
    req.body.teacher = teacherId;
  }

  req.query.group = groupId;
  req.query.teacher = teacherId;
  req.isTeachers = true;
  next();
};

exports.getBalance = (req, res, next) => {
  req.params.id = req.user.id;
  req.query.fields = "balance";
  next();
};
