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
    results: Number,

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

scoreModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ScoreModel = mongoose.model(collectionName, scoreModelSchema);

module.exports = ScoreModel;
