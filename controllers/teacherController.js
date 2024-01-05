const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getStudents = catchAsync(async (req, res, next) => {
  req.pipline = UserModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
      },
    },
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
      $match: {
        "groups.deleted": { $ne: true },
      },
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
        patronymic: "$student.patronymic",
        email: "$student.email",
        active: "$student.active",
      },
    },
  ]);
  next();
});

exports.getStudent = catchAsync(async (req, res, next) => {
  req.query.fields = "code name surname patronymic gender phoneNumbers email";
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
  if (!teacher) return next(new AppError("teacher_not_found"));

  if (req.method === "POST") req.body.teacher = teacher.id;
  req.query.teacher = teacherId;
  next();
});
