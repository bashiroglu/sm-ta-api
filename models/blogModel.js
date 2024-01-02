const mongoose = require("mongoose");

const collectionName = "Blog";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },

    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    body: {
      type: String,
    },

    viewCount: {
      type: Number,
      default: 0,
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
  this.find({ deleted: { $ne: true } });
  next();
});

// schema.post("findOne", function (doc) {
//   doc.viewCount += 1;
//   doc.save();
// });

schema.statics.q = ["title", "subtitle", "body"];

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
