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
    relatedToBalanceAfter: Number,
    relatedToBalanceBefore: Number,
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
    internal: {
      type: Boolean,
      default: false,
    },
    paidStudents: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
    },

    recurrence: {
      type: mongoose.Schema.ObjectId,
      ref: "Recurrence",
    },
    executed: Boolean,

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
  this.find({ deleted: { $ne: true } }).populate({
    path: "category",
    select: "title",
  });
  next();
});

schema.statics.q = ["title", "code"];

schema.statics.codeOptions = {
  field: collectionName,
};

schema.pre("save", async function (next) {
  if (!this.realDate) this.realDate = new Date();

  next();
});

module.exports = mongoose.model(collectionName, schema);
