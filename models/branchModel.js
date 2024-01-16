const mongoose = require("mongoose");
const collectionName = "Branch";

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
  }
);

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } }).populate({
    path: "managers",
    select: "name surname fullname",
  });
  next();
});

module.exports = mongoose.model(collectionName, schema);
