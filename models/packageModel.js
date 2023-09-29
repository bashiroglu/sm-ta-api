const mongoose = require("mongoose");

const collectionName = "Package";

const packageSchema = new mongoose.Schema(
  {
    price: Number,
    subjects: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
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

packageSchema.pre(/^find/, function (next) {
  this.find({ archived: { $ne: true } });
  next();
});

const PackageModel = mongoose.model(collectionName, packageSchema);

module.exports = PackageModel;