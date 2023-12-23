const mongoose = require("mongoose");

const collectionName = "ExamResult";

const schema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.ObjectId,
      ref: "Exam",
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    scores: {
      type: [
        {
          subject: {
            type: mongoose.Schema.ObjectId,
            ref: "Subject",
          },
          open: Number,
          close: Number,
        },
      ],
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
  this.find({ deleted: { $ne: true } });
  next();
});

schema.virtual("overall").get(function () {
  return this.scores.reduce((acc, cur) => acc + cur.score, 0);
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
