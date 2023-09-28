const mongoose = require("mongoose");

const collectionName = "Transaction";

const transactionModelSchema = new mongoose.Schema(
  {
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

transactionModelSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const TransactionModel = mongoose.model(collectionName, transactionModelSchema);

module.exports = TransactionModel;

// const mongoose = require("mongoose");
// const { getCode } = require("../../../utils/app");

// const collectionName = "Transaction";

// const transactionSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       unique: true,
//     },
//     spender: {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     recipient: {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     type: {
//       type: String,
//       enum: ["income", "expense"],
//       required: true,
//     },
//     category: {
//       type: String,
//       default: "other",
//       enum: ["other"],
//     },
//     relatedEvent: {
//       type: mongoose.Schema.ObjectId,
//       ref: "mg-event",
//     },
//     paymentMethod: {
//       type: String,
//       enum: ["online", "cash"],
//     },

//     repeatingTransaction: {
//       type: mongoose.Schema.ObjectId,
//       ref: "mg-repeatingTransaction",
//     },
//     executed: Boolean,

//     createdBy: {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//     },
//     archived: Boolean,
//   },
//   { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
// );

// transactionSchema.pre("save", async function (next) {
//   if (this.isNew) this.code = await getCode(next, collectionName, "TRNS");
// });

// transactionSchema.pre(/^find/, function (next) {
//   this.find({ archived: { $ne: true } })
//     .populate("recipient")
//     .populate("repeatingTransaction")
//     .populate("spender")
//     .populate("relatedEvent");

//   next();
// });

// const Transaction = mongoose.model(collectionName, transactionSchema);

// module.exports = Transaction;
