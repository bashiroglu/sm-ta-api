const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Branch";

const branchSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

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

branchSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "BRC");
});

branchSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "managers",
    select: "name surname fullname",
  });
  next();
});

const BranchModel = mongoose.model(collectionName, branchSchema);

module.exports = BranchModel;
