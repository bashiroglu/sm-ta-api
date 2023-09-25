const mongoose = require("mongoose");

const collectionName = "Company";

const appModelSchema = new mongoose.Schema(
  {
    name: {
      type: Number,
      required: [true, "A company must have a name."],
    },
    active: Boolean,
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

const AppModel = mongoose.model(collectionName, appModelSchema);

module.exports = AppModel;
