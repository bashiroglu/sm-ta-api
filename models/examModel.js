const mongoose = require("mongoose");

const collectionName = "Exam";

const examModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of exam is required."],
    },
    date: String,
    time: String,

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

const ExamModel = mongoose.model(collectionName, examModelSchema);

module.exports = ExamModel;
