const mongoose = require("mongoose");

const collectionName = "Bonus";

const schema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
    },
    recipients: [
      {
        user: mongoose.Schema.ObjectId,
        type: {
          type: String,
          enum: ["percent", "amount"],
          required: true,
        },
        quantity: Number,
      },
    ],

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
  this.find({ archived: { $ne: true } });
  next();
});

module.exports = mongoose.model(collectionName, schema);
