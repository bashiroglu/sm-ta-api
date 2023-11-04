const factory = require("./helpers/handlerFactory");
const GroupModel = require("../models/groupModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getGroups = factory.getAll(GroupModel);
exports.getGroup = factory.getOne(GroupModel);
exports.createGroup = factory.createOne(GroupModel);
exports.updateGroup = factory.updateOne(GroupModel);
exports.makeDeletedGroup = factory.makeDeletedOne(GroupModel);
exports.deleteGroup = factory.deleteOne(GroupModel);

exports.crudGroupLessons = catchAsync(async (req, res, next) => {
  req.query = { group: req.params.groupId, teacher: req.query.teachers };
  if (req.method === "POST") req.body = { ...req.body, ...req.query };
  next();
});

exports.pushPullArray = catchAsync(async (req, res, next) => {
  const {
    params: { id, field },
    body: { ids },
    method,
  } = req;

  const obj = {};
  let queryObj;
  if (method === "DELETE") {
    obj[field] = { $in: ids };
    queryObj = { $pull: obj };
  } else if (method === "PATCH") {
    obj[field] = { $each: ids };
    queryObj = { $push: obj };
  } else {
    queryObj = {};
  }

  req.doc = await GroupModel.findByIdAndUpdate(id, queryObj, { new: true });
  if (!req.doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  next();
});
