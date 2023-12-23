const mongoose = require("mongoose");

const collectionName = "Subject";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "required_name"],
      unique: true,
    },
    isTought: {
      type: Boolean,
      default: true,
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

const Model = mongoose.model(collectionName, schema);

module.exports = Model;
