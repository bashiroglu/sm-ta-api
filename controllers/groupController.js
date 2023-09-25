const factory = require("./helpers/handlerFactory");
const GroupModel = require("../models/groupModel");

exports.getGroups = factory.getAll(GroupModel);
exports.getGroup = factory.getOne(GroupModel);
exports.createGroup = factory.createOne(GroupModel);
exports.updateGroup = factory.updateOne(GroupModel);
exports.deleteGroup = factory.deleteOne(GroupModel);
