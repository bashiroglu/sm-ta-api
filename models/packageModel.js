const mongoose = require("mongoose");

const collectionName = "Package";

const schema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    // TODO: Apply uniqueness for all lists that needed
    subjects: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
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
  this.find({ deleted: { $ne: true } }).populate("subjects");
  next();
});

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
