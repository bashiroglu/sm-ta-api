const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Transaction";

const transactionSchema = new mongoose.Schema(
  {
    // remitter: {
    payer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // recipient: {
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
      type: String,
      default: "other",
      enum: ["other"],
    },
    method: {
      type: String,
      enum: ["online", "cash"],
    },
    recurrence: {
      type: mongoose.Schema.ObjectId,
      ref: "Recurrence",
    },
    executed: Boolean,

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

transactionSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "TRNS");
});

transactionSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const TransactionModel = mongoose.model(collectionName, transactionSchema);

module.exports = TransactionModel;
