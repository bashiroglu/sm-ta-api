const factory = require("./helpers/handlerFactory");
const SubjectModel = require("../models/subjectModel");

exports.getSubjects = factory.getAll(SubjectModel);
exports.getSubject = factory.getOne(SubjectModel);
exports.createSubject = factory.createOne(SubjectModel);
exports.updateSubject = factory.updateOne(SubjectModel);
exports.makeDeletedSubject = factory.makeDeletedOne(SubjectModel);
exports.deleteSubject = factory.deleteOne(SubjectModel);
