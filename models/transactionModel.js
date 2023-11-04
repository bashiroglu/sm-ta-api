const mongoose = require("mongoose");

const collectionName = "Transaction";

const transactionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
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
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "LowerCategory",
    },
    isIncome: {
      type: Boolean,
      required: true,
    },
    balanceAfter: Number,
    balanceBefore: Number,
    realDate: Date,
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
    },
    hidden: Boolean,
    branch: {
      type: mongoose.Schema.ObjectId,
      ref: "Branch",
    },
    relatedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    recurrence: {
      type: mongoose.Schema.ObjectId,
      ref: "Recurrence",
    },
    executed: Boolean,

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

transactionSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "category",
    select: "title",
  });
  next();
});

const TransactionModel = mongoose.model(collectionName, transactionSchema);

module.exports = TransactionModel;
