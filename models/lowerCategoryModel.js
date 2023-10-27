const mongoose = require("mongoose");
const slugify = require("slugify");

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
      required: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: Number,
      defaul: 0,
    },
    slug: String,

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

lowerCategorySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

lowerCategorySchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const LowerCategoryModel = mongoose.model(collectionName, lowerCategorySchema);

module.exports = LowerCategoryModel;
