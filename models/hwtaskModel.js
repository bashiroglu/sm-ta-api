const mongoose = require("mongoose");

const collectionName = "Hwtask";

const schema = new mongoose.Schema(
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
  this.find({ archived: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
