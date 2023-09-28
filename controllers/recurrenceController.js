const factory = require("./helpers/handlerFactory");
const RecurrenceModel = require("../models/recurrenceModel");

exports.getRecurrences = factory.getAll(RecurrenceModel);
exports.getRecurrence = factory.getOne(RecurrenceModel);
exports.createRecurrence = factory.createOne(RecurrenceModel);
exports.updateRecurrence = factory.updateOne(RecurrenceModel);
exports.deleteRecurrence = factory.deleteOne(RecurrenceModel);
