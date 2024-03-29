const mongoose = require("mongoose");
const { isValidCron } = require("cron-validator");
const {
  sendNotification,
  scheduleTask,
  getCurrentMonth,
} = require("../utils/helpers");

const collectionName = "Recurrence";

const schema = new mongoose.Schema(
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
    internal: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: Number,
      default: 0,
    },

    periodicity: {
      type: String,
      validate: {
        // TODO: Do not
        validator: (val) =>
          isValidCron(val, {
            seconds: process.env.NODE_ENV.trim() === "development",
          }),
        message: "invalid_period",
      },
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
          type: mongoose.Schema.ObjectId,
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
    archived: Boolean,
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

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.statics.jobs = {};

schema.post("save", function (doc, next) {
  if (!this.priority) this.priority = 0;

  this.query = this.title || "";
  schema.statics.jobs[doc._id] = scheduleTask(doc, sendNotification);
  next();
});

schema.post("findOneAndUpdate", function (doc) {
  // Schedule or stop notification job
  if (doc.deleted) schema.statics.jobs[doc._id].stop();
  else schema.statics.jobs[doc._id] = scheduleTask(doc, sendNotification);
});

schema.post("deleteOne", function (doc) {
  // Stop notification job
  schema.statics.jobs[doc._id].stop();
});

schema.virtual("executionCount", {
  ref: "Transaction",
  foreignField: "recurrence",
  localField: "_id",
  match: {
    $expr: {
      $and: [
        {
          $gte: ["$createdAt", getCurrentMonth().start],
        },
        {
          $lte: ["$createdAt", getCurrentMonth().end],
        },
        { $ne: ["$deleted", true] },
      ],
    },
  },
  count: true,
});

schema.statics.q = ["title", "code"];

module.exports = mongoose.model(collectionName, schema);
