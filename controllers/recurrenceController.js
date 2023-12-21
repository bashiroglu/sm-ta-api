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

exports.prepareRecurrences = catchAsync(async (req, res, next) => {
  const currentMonth = getCurrentMonth();

  req.pipeline = RecurrenceModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "transactions",
        as: "transactions",
        let: { recurrenceId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$recurrence", "$$recurrenceId"] },
                  {
                    $gte: [
                      "$createdAt",
                      // mongoose.Types.ISODate(
                      currentMonth.start,
                      // ),
                    ],
                  },
                  {
                    $lte: [
                      "$createdAt",
                      // mongoose.Types.ISODate(
                      currentMonth.end,
                      // ),
                    ],
                  },
                  { $ne: ["$deleted", true] },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        executionCount: { $size: "$transactions" },
        id: "$_id",
      },
    },
    {
      $project: {
        transactions: 0,
      },
    },
  ]);

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
