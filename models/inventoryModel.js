const mongoose = require("mongoose");
const { getCode } = require("../utils/app");

const collectionName = "Inventory";

const inventorySchema = new mongoose.Schema(
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

inventorySchema.pre("save", async function (next) {
  if (this.isNew) this.code = await getCode(next, collectionName, "INVTR");
});

inventorySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const InventoryModel = mongoose.model(collectionName, inventorySchema);

module.exports = InventoryModel;
