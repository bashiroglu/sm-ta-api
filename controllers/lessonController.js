const factory = require("./helpers/handlerFactory");
const LessonModel = require("../models/lessonModel");

exports.getLessons = factory.getAll(LessonModel);
exports.getLesson = factory.getOne(LessonModel);
exports.createLesson = factory.createOne(LessonModel);
exports.updateLesson = factory.updateOne(LessonModel);
exports.deleteLesson = factory.deleteOne(LessonModel);
