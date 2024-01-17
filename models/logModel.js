const mongoose = require("mongoose");

const collectionName = "Log";

const schema = new mongoose.Schema(
  {
    oldDoc: {
      type: String,
      required: true,
    },
    collection: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
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
  this.find({ archived: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
