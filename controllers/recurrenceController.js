const mongoose = require("mongoose");

const {
  getCurrentMonth,
  sendNotification,
  scheduleTask,
} = require("./../utils/helpers");
const factory = require("./helpers/handlerFactory");
const { Model: RecurrenceModel, jobs } = require("../models/recurrenceModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getRecurrences = factory.getAll(RecurrenceModel);
exports.getRecurrence = factory.getOne(RecurrenceModel);
exports.createRecurrence = factory.createOne(RecurrenceModel);
exports.updateRecurrence = factory.updateOne(RecurrenceModel);
exports.makeDeletedRecurrence = factory.makeDeletedOne(RecurrenceModel);
exports.deleteRecurrence = factory.deleteOne(RecurrenceModel);

exports.executeRecurrence = catchAsync(async (req, res, next) => {
  let {
    body: { newAmount, newRealDate, newPaymentMethod },
    recurrence: {
      title,
      amount,
      description,
      category,
      isIncome,
      hidden,
      paymentMethod,
      branch,
      relatedTo,
      realDate,
      id,
    },
  } = req;

  if (newAmount) amount = newAmount;
  if (newRealDate) realDate = newRealDate;
  if (newPaymentMethod) paymentMethod = newPaymentMethod;

  req.body = {
    title,
    description,
    category,
    isIncome,
    hidden,
    relatedTo,
    branch,
    amount,
    paymentMethod,
    realDate,
    recurrence: id,
    ...req.body,
  };
  next();
});

exports.scheduleRecurrenceNotifications = catchAsync(async (req, res, next) => {
  const recurrences = await RecurrenceModel.find().populate({
    path: "recipients.user",
    select: "code name surname patronymic email active",
  });
  recurrences.forEach((recurrence) => {
    jobs[recurrence.id] = scheduleTask(recurrence, sendNotification);
  });
});

exports.stopScheduleNotificationsOnDelete = catchAsync(
  async (req, res, next) => {
    // TODO: make send email, SMS and notificaiton
    jobs[req.params.id].stop();
    next();
  }
);
