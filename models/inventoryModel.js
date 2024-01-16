const mongoose = require("mongoose");

const collectionName = "Inventory";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["fixed-asset", "office-supply"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    priority: {
      type: Number,
      required: [true, "priority is required"],
    },
    stockCount: {
      type: Number,
      required: [true, "Stock count is required"],
    },
    shortageStockCount: {
      type: Number,
    },
    recommendedStockCount: {
      type: Number,
    },
    costPrice: {
      type: Number,
    },
    description: {
      type: String,
    },
    contactId: {
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

module.exports = mongoose.model(collectionName, schema);
