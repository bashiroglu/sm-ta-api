const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Hwtask";

const hwtaskSchema = new mongoose.Schema(
  {
    homework: {
      type: mongoose.Schema.ObjectId,
      ref: "Homework",
      required: [true, "Homework must belong to lesson"],
    },
    finishDate: {
      type: Date,
      default: Date.now,
    },
    isFinished: {
      type: Boolean,
      default: false,
    },
    questionTitles: [
      {
        type: String,
      },
    ],

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

hwtaskSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const HwtaskModel = mongoose.model(collectionName, hwtaskSchema);

module.exports = HwtaskModel;
