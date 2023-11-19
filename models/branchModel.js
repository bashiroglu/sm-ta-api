const mongoose = require("mongoose");
const collectionName = "Branch";

const branchSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
      required: [true, "required_company"],
    },
    name: String,
    balance: {
      type: Number,
      default: 0,
      required: [true, "required_balance"],
    },
    address: {
      type: String,
      required: [true, "required_address"],
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
