const factory = require("./helpers/handlerFactory");
const BranchModel = require("../models/branchModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.getBranches = factory.getAll(BranchModel);
exports.getBranch = factory.getOne(BranchModel);
exports.createBranch = factory.createOne(BranchModel);
exports.updateBranch = factory.updateOne(BranchModel);
exports.makeDeletedBranch = factory.makeDeletedOne(BranchModel);
exports.deleteBranch = factory.deleteOne(BranchModel);

exports.assignCompany = catchAsync(async (req, res, next) => {
  req.body.company = process.env.COMPANY_ID;
  next();
});

exports.getOnlyBlance = catchAsync(async (req, res, next) => {
  req.query.fields = "balance -managers";
  next();
});

exports.getBranchStudentCount = catchAsync(async (req, res, next) => {
  req.doc = await BranchModel.aggregate([
    // TODO: Apply following match (deleted: { $ne: true }) for all required places
    {
      $match: {
        deleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "branch",
        as: "groups",
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
      $unwind: "$groups.students",
    },
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $group: {
        _id: "$_id",
        studentsCount: { $sum: 1 },
      },
    },
  ]);

  if (!req.doc.length) {
    return next(new AppError("doc_not_found", 404));
  }

  req.doc = req.doc?.at(0);

  next();
});

exports.getStudentStat = catchAsync(async (req, res, next) => {
  req.pipeline = BranchModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "branch",
        as: "group",
      },
    },
    {
      $unwind: "$group",
    },
    {
      $unwind: "$group.students",
    },
    {
      $lookup: {
        from: "users",
        localField: "group.students",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: "$student",
    },
    {
      $project: {
        group: "$group._id",
        student: "$student._id",
        createdAt: "$student.createdAt",
      },
    },
    {
      $project: {
        student: 1,
        createdAt: 1,
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
    },
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          year: "$year",
          month: "$month",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id._id",
        stats: {
          $push: {
            year: "$_id.year",
            month: "$_id.month",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        id: "$id",
        stats: 1,
      },
    },
  ]);

  next();
});

exports.getBalanceStat = catchAsync(async (req, res, next) => {
  req.pipeline = BranchModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "branch",
        as: "transactions",
      },
    },
    {
      $unwind: {
        path: "$transactions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: { _id: "$_id", name: "$name" },
        balance: {
          $sum: "$transactions.amount",
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id._id",
        name: "$_id.name",
        balance: 1,
      },
    },
  ]);

  req.sortBy = "name";

  next();
});
