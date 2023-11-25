const mongoose = require("mongoose");
const slugify = require("slugify");

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

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
