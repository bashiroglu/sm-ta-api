const mongoose = require("mongoose");

const collectionName = "Recurrence";

const recurrenceSchema = new mongoose.Schema(
  {
    payer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    payee: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
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

recurrenceSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

recurrenceSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } })
    .populate("spender")
    .populate("recipient")
    .populate("createdBy");
  next();
});

const RecurrenceModel = mongoose.model(collectionName, recurrenceSchema);

module.exports = RecurrenceModel;
