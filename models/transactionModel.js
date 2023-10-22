const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

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
    branchBalanceAfter: Number,
    branchBalanceBefore: Number,
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
  this.find({ archived: { $ne: true } }).populate({
    path: "category",
    select: "title",
  });
  next();
});

const TransactionModel = mongoose.model(collectionName, transactionSchema);

module.exports = TransactionModel;
