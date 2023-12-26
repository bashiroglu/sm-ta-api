const factory = require("./helpers/handlerFactory");
const HwtaskModel = require("../models/hwtaskModel");

exports.getHwtasks = factory.getAll(HwtaskModel);
exports.getHwtask = factory.getOne(HwtaskModel);
exports.createHwtask = factory.createOne(HwtaskModel);
exports.updateHwtask = factory.updateOne(HwtaskModel);
exports.makeDeletedHwtask = factory.makeDeletedOne(HwtaskModel);
exports.deleteHwtask = factory.deleteOne(HwtaskModel);
