const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const name = "conversation";
const Model = require(`../models/${name}Model`);

const registerUser = catchAsync(async (req, res, next) => {
  const {
    user: { id: participant },
    params: { id },
  } = req;

  const doc = await Model.findById(id);

  if (doc.status !== "planned")
    return next(new AppError("registration_expired"));

  req.body = { $push: { participants: { participant } } };

  next();
});

const unregisterUser = catchAsync(async (req, res, next) => {
  const {
    user: { id: participant },
    params: { id },
  } = req;

  const doc = await Model.findById(id);
  if (!doc) return next(new AppError("doc_not_found", 404));

  // Following code  does not allow user to unregister
  // if it remains less than one hour to start
  const now = new Date();
  const timeDifference = doc.date - now;

  // TODO: fix tillStart value
  const tillStart = 60 * 60 * 1000;

  if (timeDifference < tillStart)
    return next(new AppError("unregister_expired", 404));

  req.body = { $pull: { participants: { participant } } };

  next();
});

const toggleArrayEl = catchAsync(async (req, res, next) => {
  const {
    method,
    params: { id, field, item: item },
  } = req;

  const key = method === "DELETE" ? "$pull" : method === "patch" ? "$push" : "";

  req.body = { [key]: { [field]: item } };
  next();
});

module.exports = {
  toggleArrayEl,
  registerUser,
  unregisterUser,
};
