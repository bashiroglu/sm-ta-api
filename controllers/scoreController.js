const factory = require("./helpers/handlerFactory");
const ScoreModel = require("../models/scoreModel");

exports.getScores = factory.getAll(ScoreModel);
exports.getScore = factory.getOne(ScoreModel);
exports.createScore = factory.createOne(ScoreModel);
exports.updateScore = factory.updateOne(ScoreModel);
exports.archiveScore = factory.archiveOne(ScoreModel);
exports.deleteScore = factory.deleteOne(ScoreModel);
