const Model = require("../models/branchModel");
const GroupModel = require("../models/groupModel");
const TransactionModel = require("../models/transactionModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const { roles } = require("../utils/constants/enums");

const setCompany = catchAsync(async (req, res, next) => {
  req.body.company = process.env.COMPANY_ID;
  next();
});

const getOnlyBlance = catchAsync(async (req, res, next) => {
  req.query.fields = "balance -managers";
  next();
});

const getStatBranchesStudentCount = catchAsync(async (req, res, next) => {
  req.pipeline = GroupModel.aggregate([
    {
      $unwind: "$students",
    },
    {
      $group: {
        _id: "$branch",
        student: { $addToSet: "$students" },
      },
    },
    {
      $project: {
        branch: "$_id",
        studentCount: { $size: "$student" },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branches",
      },
    },
    {
      $project: {
        id: 1,
        studentCount: 1,
        name: { $first: "$branches.name" },
      },
    },
  ]);

  req.query.sort = "name";

  next();
});

const getStatBranchStudentCount = catchAsync(async (req, res, next) => {
  req.pipeline = await Model.aggregate([
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

  next();
});

const getStatBranchesGroupStudentCount = catchAsync(async (req, res, next) => {
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

const getStatBranchesStudentCountByMonths = catchAsync(
  async (req, res, next) => {
    req.pipeline = Model.aggregate([
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
  }
);

const getStatBranchesBalance = catchAsync(async (req, res, next) => {
  req.pipeline = Model.aggregate([
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

const getStatBranchesIncomeByMonth = catchAsync(async (req, res, next) => {
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

const updateBalance = async (req) => {
  let {
    body: { amount, branch, isIncome },
    session,
  } = req;

  amount = amount * (isIncome || -1);
  const { balance } = await Model.findByIdAndUpdate(
    branch,
    { $inc: { balance: amount } },
    { session }
  );

  if (!(balance >= 0)) return;
  req.body.amount = amount;
  req.body.balanceBefore = balance;
  req.body.balanceAfter = balance + amount;
  return balance;
};

const checkBranch = (req, res, next) => {
  let {
    body,
    user: { roles: userRoles, branches },
  } = req;
  const branch = `${req.recurrence?.branch}` || body?.branch;
  const isAdmin = userRoles.includes(roles.ADMIN);
  if (!isAdmin) {
    const notManager = !userRoles.includes(roles.MANAGER);
    const notOwnBranch = !branches?.map((b) => b.id).includes(branch);
    if (notManager || notOwnBranch)
      return next(new AppError("not_authorized", 401));
  }
  next();
};

const checkManagerExists = catchAsync(async (req, res, next) => {
  if (!req.baseUrl.endsWith("branches")) return next();
  const branch = await Model.findById(req.params.id);
  if (!branch) return next(new AppError("doc_not_found", 404));
  if (branch.managers?.length)
    return next(new AppError("branch_has_manager", 400));
  next();
});

module.exports = {
  setCompany,
  getOnlyBlance,
  getStatBranchesStudentCount,
  getStatBranchStudentCount,
  getStatBranchesGroupStudentCount,
  getStatBranchesStudentCountByMonths,
  getStatBranchesBalance,
  getStatBranchesIncomeByMonth,
  updateBalance,
  checkBranch,
  checkManagerExists,
};
