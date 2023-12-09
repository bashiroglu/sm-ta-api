const mongoose = require("mongoose");

const collectionName = "Transaction";

const schema = new mongoose.Schema(
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

    query: { type: String, select: false },
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
  this.find({ deleted: { $ne: true } }).populate({
    path: "category",
    select: "title",
  });
  next();
});

schema.pre("save", async function (next) {
  if (!this.realDate) this.realDate = new Date();
  this.query = [
    this.title || "",
    this.category || "",
    this.amount || "",
    this.code || "",
  ].join(" ");

  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
