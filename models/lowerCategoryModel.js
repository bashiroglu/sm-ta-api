const mongoose = require("mongoose");
const slugify = require("slugify");

const collectionName = "LowerCategory";

const schema = new mongoose.Schema(
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
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      immutable: true,
    },
    deletable: {
      type: Boolean,
      default: true,
      immutable: true,
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

schema.index({ slug: 1 }, { unique: true });
// schema.path("slug").index({ unique: true });

schema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

schema.pre("save", function (next) {
  if (!this.priority) this.priority = 0;
  this.slug = slugify(this.title, { lower: true });

  next();
});

schema.pre("findOneAndUpdate", function (next) {
  const { slug } = this.getUpdate();
  if (slug) return next(new AppError("immutable_field_update", 400, "slug"));
  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
