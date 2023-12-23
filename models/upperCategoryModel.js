const mongoose = require("mongoose");
const slugify = require("slugify");
const AppError = require("../utils/appError");

const collectionName = "UpperCategory";

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      immutable: true,
    },
    restricted: {
      type: Boolean,
      immutable: true,
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

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

schema.pre("findOneAndUpdate", function (next) {
  const { slug } = this.getUpdate();
  if (slug)
    return next(new AppError("immutable_field_update", 400, { field: "slug" }));
  next();
});

const Model = mongoose.model(collectionName, schema);
module.exports = Model;
