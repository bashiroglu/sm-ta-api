const mongoose = require("mongoose");

const collectionName = "Homework";

const schema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: "Lesson",
      required: [true, "Homework must belong to lesson"],
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Homework must belong to student"],
    },
    percentage: Number,

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

module.exports = mongoose.model(collectionName, schema);
