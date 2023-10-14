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
      required: [true, "balance is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    manager: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
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

branchSchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "BRNC");
});

branchSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const BranchModel = mongoose.model(collectionName, branchSchema);

module.exports = BranchModel;
