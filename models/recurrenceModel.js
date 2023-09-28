const mongoose = require("mongoose");

const collectionName = "Recurrence";

const recurrenceModelSchema = new mongoose.Schema(
  {
    spender: {
      type: mongoose.Schema.ObjectId,
      ref: "mg-user",
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: "mg-user",
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      default: "other",
      enum: ["other"],
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
    },
    period: {
      type: String,
      required: true,
    },
    active: Boolean,
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

recurrenceModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

recurrenceModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } })
    .populate("spender")
    .populate("recipient")
    .populate("createdBy");
  next();
});

const RecurrenceModel = mongoose.model(collectionName, recurrenceModelSchema);

module.exports = RecurrenceModel;
