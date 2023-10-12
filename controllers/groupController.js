const factory = require("./helpers/handlerFactory");
const GroupModel = require("../models/groupModel");
const catchAsync = require("../utils/catchAsync");

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
