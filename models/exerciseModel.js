const mongoose = require("mongoose");

const collectionName = "Exercise";

const schema = new mongoose.Schema(
  {
    exerciseCatalog: {
      type: mongoose.Schema.ObjectId,
      ref: "ExerciseCatalog",
    },
    title: String,
    percentage: Number,
    link: String,
    description: String,
    type: {
      type: String,
      enum: ["essay", "book"],
      requred: true,
    },
    content: String,
    correct: String,

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

module.exports = mongoose.model(collectionName, schema);
