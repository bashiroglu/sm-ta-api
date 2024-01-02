const mongoose = require("mongoose");

const BookModel = require("./bookModel");

const collectionName = "Sale";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
    },
    count: {
      type: Number,
      default: 1,
    },
    revenueAmount: {
      type: Number,
      required: [true, "revenueAmount is required"],
    },
    incomeAmount: {
      type: Number,
      required: [true, "incomeAmount is required"],
    },
    expenseAmount: {
      type: Number,
      required: [true, "expenseAmount is required"],
    },
    realDate: {
      type: Date,
      default: Date.now,
    },
    givenDate: {
      type: Date,
      default: Date.now,
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

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
  this.find({ archived: { $ne: true } });
  next();
});

schema.post("save", async function (doc) {
  await BookModel.findByIdAndUpdate(doc.book, {
    $inc: { stockCount: -doc.count },
  });
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
