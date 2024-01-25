const mongoose = require("mongoose");

const collectionName = "ExerciseCatalog";

const schema = new mongoose.Schema(
  {
    unit: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    level: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
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

module.exports = mongoose.model(collectionName, schema);
