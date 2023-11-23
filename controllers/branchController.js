const factory = require("./helpers/handlerFactory");
const BranchModel = require("../models/branchModel");
const GroupModel = require("../models/groupModel");
const TransactionModel = require("../models/transactionModel");
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

exports.getAllStudentCountStat = catchAsync(async (req, res, next) => {
  req.pipeline = GroupModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: "$branch",
        studentCount: {
          $sum: { $size: "$students" },
        },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branch",
      },
    },
    {
      $unwind: "$branch",
    },
    {
      $project: {
        studentCount: 1,
        name: "$branch.name",
      },
    },
  ]);

  req.query.sort = "name";

  next();
});

exports.getOneStudentCountStat = catchAsync(async (req, res, next) => {
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

exports.getAllStudentCountStatByMonths = catchAsync(async (req, res, next) => {
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
        name: 1,
      },
    },
    {
      $project: {
        student: 1,
        createdAt: 1,
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        name: 1,
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
          name: "$name",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: {
          id: "$_id._id",
          name: "$_id.name",
        },
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
        stats: {
          $sortArray: { input: "$stats", sortBy: { month: 1 } },
        },
        name: "$_id.name",
        id: "$_id.id",
        _id: "$_id.id",
      },
    },
  ]);
  req.query.sort = "name";

  next();
});

exports.getAllBalanceStat = catchAsync(async (req, res, next) => {
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

  req.query.sort = "name";

  next();
});

exports.getAllBalanceStatByMonth = catchAsync(async (req, res, next) => {
  const [sixMonths, now] = [
    new Date(new Date().setMonth(new Date().getMonth() - 6)),
    new Date(Date.now()),
  ];
  const { from = sixMonths, to = now } = req.query;
  delete req.query.from;
  delete req.query.to;

  req.pipeline = TransactionModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branch",
      },
    },
    {
      $unwind: "$branch",
    },
    {
      $project: {
        id: "$branch._id",
        name: "$branch.name",
        createdAt: 1,
        amount: 1,
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
    },
    {
      $group: {
        _id: {
          _id: "$id",
          year: "$year",
          month: "$month",
          name: "$name",
        },
        balance: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: {
          id: "$_id._id",
          name: "$_id.name",
        },
        stats: {
          $push: {
            year: "$_id.year",
            month: "$_id.month",
            balance: "$balance",
          },
        },
      },
    },
    {
      $project: {
        _id: "$_id.id",
        id: "$_id.id",
        name: "$_id.name",
        stats: {
          $sortArray: { input: "$stats", sortBy: { month: 1 } },
        },
      },
    },
  ]);
  req.query.sort = "name";
  next();
});
