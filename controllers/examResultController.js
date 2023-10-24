const factory = require("./helpers/handlerFactory");
const ExamResultModel = require("../models/examResultModel");

exports.getExamResults = factory.getAll(ExamResultModel);
exports.getExamResult = factory.getOne(ExamResultModel);
exports.createExamResult = factory.createOne(ExamResultModel);
exports.updateExamResult = factory.updateOne(ExamResultModel);
exports.archiveExamResult = factory.archiveOne(ExamResultModel);
exports.deleteExamResult = factory.deleteOne(ExamResultModel);