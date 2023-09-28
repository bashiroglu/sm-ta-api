const mongoose = require("mongoose");

const collectionName = "Score";

const scoreSchema = new mongoose.Schema(
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

scoreSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ScoreModel = mongoose.model(collectionName, scoreSchema);

module.exports = ScoreModel;
