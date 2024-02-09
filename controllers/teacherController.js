const catchAsync = require("../utils/catchAsync");

exports.getStudents = catchAsync(async (req, res, next) => {
  await req.user
    .populate({ path: "teacherGroups", populate: "enrollments" })
    .execPopulate();

  const students = req.user.teacherGroups.reduce(
    (_, cur) => [...(cur.enrollments.map((e) => e.student) || [])],
    []
  );

  req.query._id = { $in: students };
  next();
});

exports.getStudent = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, fields: "-teachers", teachers: req.user.id };
  req.popOptions = [
    { path: "room", select: "name" },
    { path: "students", select: "name surname code profileImage" },
  ];
  next();
});

exports.directGroups = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, fields: "-teachers", teachers: req.user.id };
  req.popOptions = [{ path: "room", select: "name" }];
  next();
});

exports.directLessons = catchAsync(async (req, res, next) => {
  const {
    params: { id },
    user: { id: teacherId, subject },
  } = req;

  if (req.method === "POST") {
    req.body.group = id;
    req.body.teacher = teacherId;
    req.body.subject = subject;
  }

  req.query.group = id;
  req.query.teacher = teacherId;
  next();
});
