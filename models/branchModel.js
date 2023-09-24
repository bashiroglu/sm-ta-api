const mongoose = require("mongoose");

const collectionName = "Branch";

const branchModelSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
      required: [true, "Branch must belong to a company"],
    },
    balance: {
      type: Number,
      required: [true, "balance is required"],
    },
    address: {
      type: Number,
      required: [true, "address is required"],
    },
    manager: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    teachers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
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

const BranchModel = mongoose.model(collectionName, branchModelSchema);

module.exports = BranchModel;
