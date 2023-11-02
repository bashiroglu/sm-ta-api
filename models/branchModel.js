const mongoose = require("mongoose");
const collectionName = "Branch";

const branchSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
      required: [true, "Branch must belong to a company"],
    },
    name: String,
    balance: {
      type: Number,
      default: 0,
      required: [true, "balance is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    managers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
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

branchSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "managers",
    select: "name surname fullname",
  });
  next();
});

const BranchModel = mongoose.model(collectionName, branchSchema);

module.exports = BranchModel;
