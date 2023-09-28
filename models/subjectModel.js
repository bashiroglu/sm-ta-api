const mongoose = require("mongoose");

const collectionName = "Subject";

const subjectModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of subject is required."],
    },
    isTought: {
      type: Boolean,
      default: true,
    },

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

subjectModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const SubjectModel = mongoose.model(collectionName, subjectModelSchema);

module.exports = SubjectModel;
