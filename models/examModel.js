const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Exam";

const examSchema = new mongoose.Schema(
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

examSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "EXAM", 8);
});

examSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ExamModel = mongoose.model(collectionName, examSchema);

module.exports = ExamModel;