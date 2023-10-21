const mongoose = require("mongoose");

const collectionName = "LowerCategory";

const lowerCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    upperCategory: {
      type: mongoose.Schema.ObjectId,
      ref: "UpperCategory",
    },
    description: {
      type: String,
    },
    priority: {
      type: Number,
      defaul: 0,
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

lowerCategorySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const LowerCategoryModel = mongoose.model(collectionName, lowerCategorySchema);

module.exports = LowerCategoryModel;
