const mongoose = require("mongoose");
const GroupModel = require("../models/groupModel");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getStudents = catchAsync(async (req, res, next) => {
  req.pipline = UserModel.aggregate([
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "teachers",
        as: "groups",
      },
    },
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user.id),
      },
    },
    {
      $unwind: "$groups",
    },
    {
      $project: {
        teacherId: "$_id",
        students: "$groups.students",
      },
    },
    {
      $unwind: "$students",
    },
    {
      $group: {
        _id: "$teacherId",
        student: { $addToSet: "$students" },
      },
    },
    {
      $unwind: "$student",
    },
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: "$student",
    },
    {
      $project: {
        _id: "$student._id",
        code: "$student.code",
        name: "$student.name",
        surname: "$student.surname",
        fatherName: "$student.fatherName",
        email: "$student.email",
        active: "$student.active",
      },
    },
  ]);
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
