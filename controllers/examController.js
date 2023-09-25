const factory = require("./helpers/handlerFactory");
const ExamModel = require("../models/examModel");

exports.getExams = factory.getAll(ExamModel);
exports.getExam = factory.getOne(ExamModel);
exports.createExam = factory.createOne(ExamModel);
exports.updateExam = factory.updateOne(ExamModel);
exports.deleteExam = factory.deleteOne(ExamModel);
