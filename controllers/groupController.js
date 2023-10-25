const factory = require("./helpers/handlerFactory");
const GroupModel = require("../models/groupModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getGroups = factory.getAll(GroupModel);
exports.getGroup = factory.getOne(GroupModel);
exports.createGroup = factory.createOne(GroupModel);
exports.updateGroup = factory.updateOne(GroupModel);
exports.archiveGroup = factory.archiveOne(GroupModel);
exports.deleteGroup = factory.deleteOne(GroupModel);

exports.crudGroupLessons = catchAsync(async (req, res, next) => {
  req.query = { group: req.params.groupId, teacher: req.query.teachers };
  if (req.method === "POST") req.body = { ...req.body, ...req.query };
  next();
});

exports.pushPullArray = catchAsync(async (req, res, next) => {
  const { id, field, userId } = req.params;
  const obj = {};
  obj[field] = userId;
  console.log(req.method);
  const queryObj =
    req.method === "DELETE"
      ? { $pull: obj }
      : req.method === "PATCH"
      ? { $push: obj }
      : {};
  req.doc = await GroupModel.findByIdAndUpdate(id, queryObj);
  if (!req.doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  next();
});
