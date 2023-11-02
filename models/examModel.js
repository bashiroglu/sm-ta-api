const mongoose = require("mongoose");

const collectionName = "Exam";

const examSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name of exam is required."],
    },
    date: Date,
    subjects: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
    },

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

examSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const ExamModel = mongoose.model(collectionName, examSchema);

module.exports = ExamModel;
