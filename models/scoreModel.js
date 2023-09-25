const mongoose = require("mongoose");

const collectionName = "Score";

const scoreModelSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.ObjectId,
      ref: "Exam",
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    results: String,

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

const ScoreModel = mongoose.model(collectionName, scoreModelSchema);

module.exports = ScoreModel;
