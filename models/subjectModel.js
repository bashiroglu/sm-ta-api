const mongoose = require("mongoose");

const collectionName = "Subject";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of subject is required."],
      unique: true,
    },
    isTought: {
      type: Boolean,
      default: true,
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

subjectSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const SubjectModel = mongoose.model(collectionName, subjectSchema);

module.exports = SubjectModel;
