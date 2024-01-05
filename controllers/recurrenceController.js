const mongoose = require("mongoose");

const { sendNotification, scheduleTask } = require("./../utils/helpers");
const Model = require("../models/recurrenceModel");
const catchAsync = require("../utils/catchAsync");

const executeRecurrence = catchAsync(async (req, res, next) => {
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

const scheduleRecurrenceNotifications = catchAsync(async (req, res, next) => {
  const recurrences = await Model.find().populate({
    path: "recipients.user",
    select: "code name surname patronymic email active",
  });

  recurrences.forEach((recurrence) => {
    Model.schema.statics.jobs[recurrence.id] = scheduleTask(
      recurrence,
      sendNotification
    );
  });
});

const stopScheduleNotificationsOnDelete = catchAsync(async (req, res, next) => {
  // TODO: make send email, SMS and notificaiton
  Model.schema.statics.jobs[req.params.id].stop();
  next();
});

module.exports = {
  executeRecurrence,
  scheduleRecurrenceNotifications,
  stopScheduleNotificationsOnDelete,
};
