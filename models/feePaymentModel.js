const mongoose = require("mongoose");

const collectionName = "FeePayment";

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    package: {
      type: mongoose.Schema.ObjectId,
      ref: "Package",
    },

    amount: Number,
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

feePaymentSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const FeePaymentModel = mongoose.model(collectionName, feePaymentSchema);

module.exports = FeePaymentModel;
