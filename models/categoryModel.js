const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Category";

const categorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    name: { type: String },
    description: { type: String },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "maincategory",
      required: [true, "createdBy must belong to a user"],
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

categorySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const ExamModel = mongoose.model(collectionName, categorySchema);

module.exports = ExamModel;
