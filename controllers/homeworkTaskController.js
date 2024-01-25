const AppError = require("../utils/appError");
const Model = require("../models/homeworkTaskModel");
const catchAsync = require("../utils/catchAsync");

const startEndTask = catchAsync(async (req, res, next) => {
  const {
    params: { id, action },
    user: { id: userId },
  } = req;

  if (!["start", "end"].includes(action))
    return next(new AppError("dont_use_this_endpoint", 400));

  const doc = await Model.findById(id).populate("homework");
  if (!doc) return next(new AppError("doc_not_found", 404));

  if ((action === "end") & !doc?.startedAt)
    return next(new AppError("task_not_started", 400));

  if (`${doc?.homework?.student}` !== `${userId}`)
    return next(new AppError("not_your_task", 400));

  const field = `${action}edAt`;
  req.body = { [field]: new Date() };

  next();
});

module.exports = { startEndTask };
