const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "FeePayment";

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    program: {
      type: mongoose.Schema.ObjectId,
      ref: "Program",
    },
    amount: {
      type: Number,
      required: true,
    },

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

feePaymentSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "EXAM", 8);
});

feePaymentSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const FeePaymentModel = mongoose.model(collectionName, feePaymentSchema);

module.exports = FeePaymentModel;
