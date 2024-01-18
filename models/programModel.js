const mongoose = require("mongoose");

const collectionName = "Program";

const schema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    predictedPayment: {
      type: Number,
    },
    lessonCount: {
      type: Number,
    },
    permissionCount: {
      type: Number,
    },
    lessonsDuration: {
      type: Number,
    },
    possibleParticipantCount: Number,
    monthly: {
      type: Boolean,
      default: true,
    },

    name: String,
    price: Number,
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
  },
);

schema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
