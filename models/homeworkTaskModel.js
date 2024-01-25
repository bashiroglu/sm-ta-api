const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const collectionName = "HomeworkTask";

const schema = new mongoose.Schema(
  {
    homework: {
      type: mongoose.Schema.ObjectId,
      ref: "Homework",
    },
    exercise: {
      type: mongoose.Schema.ObjectId,
      ref: "Exercise",
    },
    percentage: Number,
    startedAt: Date,
    endedAt: Date,

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

schema.statics.codeOptions = {
  field: collectionName,
};

module.exports = mongoose.model(collectionName, schema);
