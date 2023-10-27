const factory = require("./helpers/handlerFactory");
const FeedbackModel = require("../models/feedbackModel");
const catchAsync = require("../utils/catchAsync");

exports.getFeedbacks = factory.getAll(FeedbackModel);
exports.getFeedback = factory.getOne(FeedbackModel);
exports.createFeedback = factory.createOne(FeedbackModel);
exports.updateFeedback = factory.updateOne(FeedbackModel);
exports.makeDeletedFeedback = factory.makeDeletedOne(FeedbackModel);
exports.deleteFeedback = factory.deleteOne(FeedbackModel);

exports.restrictFeedbacks = catchAsync(async (req, res, next) => {
  if (req.user.roles.includes("teacher")) {
    req.query.createdBy = req.user.id;
  }
  if (req.user.roles.includes("guardian")) {
    req.query.student = { $in: req.user.children };
  }
  next();
});
