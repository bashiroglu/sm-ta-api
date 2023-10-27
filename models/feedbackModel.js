const mongoose = require("mongoose");

const collectionName = "Feedback";

const subjectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: "Lesson",
    },
    title: String,
    content: String,
    isRead: Boolean,

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

subjectSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const SubjectModel = mongoose.model(collectionName, subjectSchema);

module.exports = SubjectModel;
