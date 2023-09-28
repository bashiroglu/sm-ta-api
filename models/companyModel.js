const mongoose = require("mongoose");

const collectionName = "Company";

const companyModelschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A company must have a name."],
    },
    code: String,
    balance: { type: Number, default: 0 },
    branch: { type: Number, default: 0 },
    group: { type: Number, default: 0 },
    user: { type: Number, default: 0 },
    exam: { type: Number, default: 0 },
    active: Boolean,
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

companyModelschema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const AppModel = mongoose.model(collectionName, companyModelschema);

module.exports = AppModel;
