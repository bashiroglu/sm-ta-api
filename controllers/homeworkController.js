const factory = require("./helpers/handlerFactory");
const HomeworkModel = require("../models/homeworkModel");

exports.getHomeworks = factory.getAll(HomeworkModel);
exports.getHomework = factory.getOne(HomeworkModel);
exports.createHomework = factory.createOne(HomeworkModel);
exports.updateHomework = factory.updateOne(HomeworkModel);
exports.makeDeletedHomework = factory.makeDeletedOne(HomeworkModel);
exports.deleteHomework = factory.deleteOne(HomeworkModel);
