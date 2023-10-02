const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Homework";

const homeworkSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.ObjectId,
      ref: "Lesson",
      required: [true, "Homework must belong to lesson"],
    },
    studentId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Homework must be belong to user"],
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
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

homeworkSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const HomeworkModel = mongoose.model(collectionName, homeworkSchema);

module.exports = HomeworkModel;
