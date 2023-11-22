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
      required: [true, "required_name"],
    },
    type: {
      type: String,
      enum: {
        values: ["b9", "b11", "q"],
        message: "enum_exam_type",
      },
      required: [true, "required_exam_type"],
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
    participants: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "User",
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
