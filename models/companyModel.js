const mongoose = require("mongoose");

const collectionName = "Company";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "required_name."],
    },
    balance: { type: Number, default: 0 },

    exam: { type: Number, default: 0 },
    feedback: { type: Number, default: 0 },
    group: { type: Number, default: 0 },
    lesson: { type: Number, default: 0 },
    transaction: { type: Number, default: 0 },
    user: { type: Number, default: 0 },
    isUnderConstruction: {
      type: Boolean,
      default: false,
    },

    active: Boolean,
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
