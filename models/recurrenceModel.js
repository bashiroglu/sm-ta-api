const mongoose = require("mongoose");
const TransactionModel = require("./transactionModel");
const { sendNotification, scheduleTask } = require("../utils/helpers");

const collectionName = "Recurrence";

const recurrenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    isIncome: {
      type: Boolean,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
    },
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
    },
    relatedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    priority: {
      type: Number,
      default: 0,
    },

    periodicity: {
      type: String,
      required: true,
    },
    remindDuration: {
      type: Number,
    },
    dueDate: {
      type: Date,
    },
    recipients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notifications: {
          type: [String],
          enum: ["sms", "email", "push"],
        },
      },
    ],

    hidden: Boolean,

    active: Boolean,
    deleted: Boolean,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recurrenceSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const jobs = {};

recurrenceSchema.post("save", function (doc, next) {
  jobs[doc._id] = scheduleTask(doc, sendNotification);

  console.log("Recurrence created");
  next();
});

recurrenceSchema.post("findOneAndUpdate", function (doc) {
  jobs[doc._id] = scheduleTask(doc, sendNotification);
});

const RecurrenceModel = mongoose.model(collectionName, recurrenceSchema);

module.exports = { RecurrenceModel, jobs };
