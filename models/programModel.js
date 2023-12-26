const mongoose = require("mongoose");

const collectionName = "Program";

const schema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    predictedPayment: {
      type: Number,
    },
    lessonsCount: {
      type: Number,
    },
    permissionsCount: {
      type: Number,
    },
    lessonsDuration: {
      type: Number,
    },
    maxDefaultParticipantCount: Number,

    name: String,
    price: Number,

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

schema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
