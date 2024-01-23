const mongoose = require("mongoose");

const collectionName = "Exercise";

const schema = new mongoose.Schema(
  {
    title: String,
    type: {
      type: String,
      enum: ["essay"],
    },
    content: String,

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
