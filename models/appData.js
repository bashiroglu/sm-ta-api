const mongoose = require("mongoose");

const collectionName = "branch";

const branchModelSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      required: [true, "balance is required"],
    },
    address: {
      type: Number,
      required: [true, "address is required"],
    },
    branchManager: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    archived: Boolean,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const AppModel = mongoose.model(collectionName, branchModelSchema);

module.exports = AppModel;
