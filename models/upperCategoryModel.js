const mongoose = require("mongoose");
const slugify = require("slugify");

const collectionName = "UpperCategory";

const upperCategorySchema = new mongoose.Schema(
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

upperCategorySchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

upperCategorySchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

upperCategorySchema.virtual("lowers", {
  ref: "LowerCategory",
  foreignField: "upperCategory",
  localField: "_id",
});

const RoomModel = mongoose.model(collectionName, upperCategorySchema);

module.exports = RoomModel;
