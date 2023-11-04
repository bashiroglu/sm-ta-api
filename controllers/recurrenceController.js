const mongoose = require("mongoose");

const {
  getCurrentMonth,
  sendNotification,
  scheduleTask,
} = require("./../utils/helpers");
const factory = require("./helpers/handlerFactory");
const { RecurrenceModel, jobs } = require("../models/recurrenceModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getRecurrences = factory.getAll(RecurrenceModel);
exports.getRecurrence = factory.getOne(RecurrenceModel);
exports.createRecurrence = factory.createOne(RecurrenceModel);
exports.updateRecurrence = factory.updateOne(RecurrenceModel);
exports.makeDeletedRecurrence = factory.makeDeletedOne(RecurrenceModel);
exports.deleteRecurrence = factory.deleteOne(RecurrenceModel);

exports.executeRecurrence = catchAsync(async (req, res, next) => {
  const {
    body: { newAmount, newRealDate, newPaymentMethod },
    params: { id },
    session,
  } = req;

  try {
    const recurrence = await RecurrenceModel.findById(id).session(session);

    if (!recurrence) {
      await session.abortTransaction();
      return next(new AppError("No document found with that ID", 404));
    }
    let {
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
    } = recurrence;

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
  } catch (err) {
    await session.abortTransaction();
    return next(new AppError(err.message, 404));
  }
});

exports.prepareRecurrences = catchAsync(async (req, res, next) => {
  const currentMonth = getCurrentMonth();

  req.pipeline = RecurrenceModel.aggregate([
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "recurrence",
        as: "transactions",
      },
    },
    {
      $match: {
        "transactions.createdAt": {
          $gte: currentMonth.start,
          $lte: currentMonth.end,
        },
      },
    },

    {
      $unwind: {
        path: "$transactions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        executionCount: { $sum: 1 },
        doc: { $first: "$$ROOT" },
      },
    },
    {
      $project: {
        priority: "$doc.priority",
        title: "$doc.title",
        amount: "$doc.amount",
        description: "$doc.description",
        category: "$doc.category",
        isIncome: "$doc.isIncome",
        paymentMethod: "$doc.paymentMethod",
        branch: "$doc.branch",
        relatedTo: "$doc.relatedTo",
        periodicity: "$doc.periodicity",
        remindDuration: "$doc.remindDuration",
        dueDate: "$doc.dueDate",
        hidden: "$doc.hidden",
        recipients: "$doc.recipients",
        createdBy: "$doc.createdBy",
        createdAt: "$doc.createdAt",
        updatedAt: "$doc.updatedAt",
        executionCount: 1,
      },
    },
  ]);

  next();
});

exports.scheduleRecurrenceNotifications = catchAsync(async (req, res, next) => {
  const recurrences = await RecurrenceModel.find().populate({
    path: "recipients.user",
    select: "code name surname fatherName email active",
  });
  recurrences.forEach((recurrence) => {
    jobs[recurrence.id] = scheduleTask(recurrence, sendNotification);
  });
});

exports.stopScheduleNotificationsOnDelete = catchAsync(
  async (req, res, next) => {
    jobs[req.params.id].stop();
    next();
  }
);
