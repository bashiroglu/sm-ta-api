const mongoose = require("mongoose");

const collectionName = "app";

const appModelSchema = new mongoose.Schema(
  {
    name: {
      type: Number,
    },
    active: Boolean,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const AppModel = mongoose.model(collectionName, appModelSchema);

module.exports = AppModel;
