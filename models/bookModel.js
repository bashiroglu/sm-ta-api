const mongoose = require("mongoose");

const collectionName = "Book";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    barcodes: [
      {
        type: String,
        unique: true,
      },
    ],
    name: {
      type: String,
    },
    sellingPrice: {
      type: Number,
    },
    stockCount: {
      type: Number,
    },
    recommendedStockCount: {
      type: Number,
    },
    shortageStockCount: {
      type: Number,
    },
    entrancePrice: {
      type: Number,
    },
    description: {
      type: String,
    },

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
  this.find({ archived: { $ne: true } });
  next();
});

schema.statics.codeOptions = {
  field: collectionName,
};

module.exports = mongoose.model(collectionName, schema);
