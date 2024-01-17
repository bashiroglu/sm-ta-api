const factory = require("./helpers/handlerFactory");
const BranchModel = require("../models/branchModel");

<<<<<<< Updated upstream
exports.getBranches = factory.getAll(BranchModel);
exports.getBranch = factory.getOne(BranchModel);
exports.createBranch = factory.createOne(BranchModel);
exports.updateBranch = factory.updateOne(BranchModel);
exports.archiveBranch = factory.archiveOne(BranchModel);
exports.deleteBranch = factory.deleteOne(BranchModel);
=======
const setCompany = catchAsync(async (req, res, next) => {
  req.body.company = process.env.COMPANY_ID;
  next();
});

const getOnlyBlance = catchAsync(async (req, res, next) => {
  req.query.fields = "balance -managers";
  next();
});

const getStatBranchesStudentCount = catchAsync(async (req, res, next) => {
  req.query.sort = "name";

  next();
});

const getStatBranchStudentCount = catchAsync(async (req, res, next) => {
  // azı bir enrollmenti olan userlərin sayı
  const {
    params: { id },
  } = req;

  const branch = await Model.findById(id).populate({
    path: "groups",
    select: "groups",
    populate: {
      path: "enrollments",
      populate: "student",
      count: true,
    },
  });

  console.log(branch);

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

module.exports = {
  setCompany,
  getOnlyBlance,
  getStatBranchesStudentCount,
  getStatBranchStudentCount,
  getStatBranchesGroupStudentCount,
  getStatBranchesStudentCountByMonths,
  getStatBranchesBalance,
  getStatBranchesIncomeByMonth,
};
>>>>>>> Stashed changes
