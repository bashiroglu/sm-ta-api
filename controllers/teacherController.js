const GroupModel = require("../models/groupModel");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getStudents = catchAsync(async (req, res, next) => {
  const groups = await GroupModel.find({ teachers: req.user.id });
  req.ids = groups.reduce((arr, group) => [...group.students], []);
  req.query.fields = "code name surname fatherName email active";
  req.popOptions = {
    path: "groups",
    select: "name teachers",
  };
  next();
});

exports.getStudent = catchAsync(async (req, res, next) => {
  req.query.fields = "code name surname fatherName gender phoneNumbers email";
  req.popOptions = {
    path: "groups",
    select: "name teachers",
  };
  next();
});

exports.directGroups = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, fields: "-teachers", teachers: req.user.id };
  req.popOptions = {
    path: "students",
    select: "name surname",
  };
  next();
});

exports.directLessons = catchAsync(async (req, res, next) => {
  const teacherId = req.user.id;
  const teacher = await UserModel.findById(teacherId);
  if (!teacher) return next(new AppError("Teacher not found!"));

  if (req.method === "POST") {
    req.body.teacher = teacher.id;
    req.body.subject = teacher.subject;
  }

  req.query.teacher = teacherId;
  next();
});