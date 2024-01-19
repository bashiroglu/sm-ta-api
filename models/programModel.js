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
    groupType: {
      type: String,
      enum: ["individual", "group"],
    },
    lessonType: {
      type: String,
      enum: ["online", "traditional"],
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
  }
);

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
