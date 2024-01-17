const mongoose = require("mongoose");

const collectionName = "Homework";

const schema = new mongoose.Schema(
  {
    lesson: {
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
