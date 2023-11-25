const mongoose = require("mongoose");
const { isValidCron } = require("cron-validator");
const { sendNotification, scheduleTask } = require("../utils/helpers");

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

    query: { type: String, select: false },
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

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const jobs = {};

schema.post("save", function (doc, next) {
  this.query = this.title || "";
  jobs[doc._id] = scheduleTask(doc, sendNotification);
  next();
});

schema.post("findOneAndUpdate", function (doc) {
  if (doc.deleted) jobs[doc._id].stop();
  else jobs[doc._id] = scheduleTask(doc, sendNotification);
});

schema.post("deleteOne", function (doc) {
  jobs[doc._id].stop();
});

const Model = mongoose.model(collectionName, schema);

module.exports = { Model, jobs };
