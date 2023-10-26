const factory = require("./helpers/handlerFactory");
const FeedbackModel = require("../models/feedbackModel");

exports.getFeedbacks = factory.getAll(FeedbackModel);
exports.getFeedback = factory.getOne(FeedbackModel);
exports.createFeedback = factory.createOne(FeedbackModel);
exports.updateFeedback = factory.updateOne(FeedbackModel);
exports.archiveFeedback = factory.archiveOne(FeedbackModel);
exports.deleteFeedback = factory.deleteOne(FeedbackModel);
