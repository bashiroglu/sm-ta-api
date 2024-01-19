const mongoose = require("mongoose");

const collectionName = "Log";

const schema = new mongoose.Schema(
  {
    oldDoc: {
      type: Object,
    },
    body: {
      type: Object,
    },
    originalUrl: String,
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
