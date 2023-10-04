const factory = require("./helpers/handlerFactory");
const ProgramModel = require("../models/programModel");

exports.getPrograms = factory.getAll(ProgramModel);
exports.getProgram = factory.getOne(ProgramModel);
exports.createProgram = factory.createOne(ProgramModel);
exports.updateProgram = factory.updateOne(ProgramModel);
exports.archiveProgram = factory.archiveOne(ProgramModel);
exports.deleteProgram = factory.deleteOne(ProgramModel);
