const mongoose = require("mongoose");
const selectVariations = require("../utils/constants/selectVariations");
const collectionName = "Branch";
console.log(selectVariations);
const schema = new mongoose.Schema(
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
  },
);

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "managers",
    select: selectVariations.user.xs,
  });
  next();
});

module.exports = mongoose.model(collectionName, schema);
