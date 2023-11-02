const mongoose = require("mongoose");

const collectionName = "Company";

const companySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "A company must have a name."],
    },
    balance: { type: Number, default: 0 },

    book: { type: Number, default: 0 },
    group: { type: Number, default: 0 },
    inventory: { type: Number, default: 0 },
    lesson: { type: Number, default: 0 },
    transaction: { type: Number, default: 0 },
    user: { type: Number, default: 0 },

    active: Boolean,
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

companySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } }).select("-balance");
  next();
});

const AppModel = mongoose.model(collectionName, companySchema);

module.exports = AppModel;
